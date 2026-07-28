#!/usr/bin/env node
/**
 * Drains the Firestore push outbox and delivers each queued notification.
 *
 * This is the server half of "compose in /admin, auto-send": the admin console
 * writes a notification to the `pushOutbox` collection as `pending`; this script
 * (run on a schedule by .github/workflows/send-push.yml) signs in as the admin,
 * fans each pending row out to every push subscription with the VAPID private
 * key, marks the row `sent` with delivery counts, and prunes dead subscriptions.
 *
 * The VAPID private key and admin credentials come from GitHub Secrets — they
 * are never in the repo and never reach the browser. Nothing here needs the
 * Firebase Admin SDK, Cloud Functions, or billing.
 *
 * Required env (GitHub Secrets): VAPID_PRIVATE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD.
 * Optional: VAPID_PUBLIC_KEY, VAPID_SUBJECT, FIREBASE_API_KEY (safe defaults).
 */

import webpush from 'web-push';

const PROJECT = 'msdevbuild-blog';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyC1oOQOPnd4i-6W0vXkhDHrzRAFYpd0nDk';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const VAPID_PUBLIC =
  process.env.VAPID_PUBLIC_KEY ||
  'BJdVP1Fm0wckAPotGdybEqQnxcrv9zWITDdq0PPU3MbtgvHxSMwWByudsKmQGr8eyG307zLamI0bu-8ZMLk6erI';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:jssuthahar@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function requireEnv() {
  const missing = [];
  if (!VAPID_PRIVATE) missing.push('VAPID_PRIVATE_KEY');
  if (!ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (missing.length) {
    console.error(`✗ Missing env/secrets: ${missing.join(', ')}.`);
    process.exit(1);
  }
}

async function adminToken() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }),
    },
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Admin sign-in failed: ${body?.error?.message || res.status}`);
  return body.idToken;
}

/** Pending notifications waiting to go out. */
async function pendingNotifications(token) {
  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'pushOutbox' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'status' },
            op: 'EQUAL',
            value: { stringValue: 'pending' },
          },
        },
        limit: 20,
      },
    }),
  });
  const rows = await res.json();
  if (!res.ok) throw new Error(`Outbox read failed: ${rows?.error?.message || res.status}`);

  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r.document)
    .map(({ document }) => ({
      name: document.name,
      id: document.name.split('/').pop(),
      title: document.fields?.title?.stringValue || '',
      body: document.fields?.body?.stringValue || '',
      url: document.fields?.url?.stringValue || '/',
    }));
}

/** Patch only the given fields on an outbox row (status + counts). */
async function patchOutbox(token, name, fields) {
  const mask = Object.keys(fields)
    .map((f) => `updateMask.fieldPaths=${f}`)
    .join('&');
  await fetch(`https://firestore.googleapis.com/v1/${name}?${mask}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields }),
  });
}

async function listSubscriptions(token) {
  const docs = [];
  let pageToken = '';
  do {
    const url = new URL(`${BASE}/pushSubscriptions`);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json();
    if (!res.ok) throw new Error(`Subscription list failed: ${body?.error?.message || res.status}`);
    for (const doc of body.documents || []) {
      const f = doc.fields || {};
      docs.push({
        name: doc.name,
        endpoint: f.endpoint?.stringValue,
        p256dh: f.p256dh?.stringValue,
        auth: f.auth?.stringValue,
      });
    }
    pageToken = body.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function deleteDoc(token, name) {
  await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

/** Send one notification to every subscription; returns {delivered,pruned,failed}. */
async function fanOut(token, subs, notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    url: notification.url,
  });

  let delivered = 0;
  let pruned = 0;
  let failed = 0;

  const BATCH = 50;
  for (let i = 0; i < subs.length; i += BATCH) {
    const batch = subs.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (sub) => {
        if (!sub.endpoint || !sub.p256dh || !sub.auth) return;
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          );
          delivered++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await deleteDoc(token, sub.name); // dead subscription — remove it
            pruned++;
          } else {
            failed++;
          }
        }
      }),
    );
  }
  return { delivered, pruned, failed };
}

async function main() {
  requireEnv();
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  const token = await adminToken();
  const pending = await pendingNotifications(token);

  if (!pending.length) {
    console.log('Outbox empty — nothing to send.');
    return;
  }

  const subs = await listSubscriptions(token);
  console.log(`${pending.length} queued notification(s), ${subs.length} subscriber(s).`);

  for (const note of pending) {
    // Claim it first so an overlapping run cannot send it twice.
    await patchOutbox(token, note.name, { status: { stringValue: 'sending' } });

    const { delivered, pruned, failed } = await fanOut(token, subs, note);

    await patchOutbox(token, note.name, {
      status: { stringValue: 'sent' },
      sentAt: { timestampValue: new Date().toISOString() },
      delivered: { integerValue: String(delivered) },
      pruned: { integerValue: String(pruned) },
      failed: { integerValue: String(failed) },
    });

    console.log(`✓ "${note.title}" — delivered ${delivered}, pruned ${pruned}, failed ${failed}.`);
  }
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
