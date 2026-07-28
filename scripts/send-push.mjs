#!/usr/bin/env node
/**
 * Sends a Web Push notification to every installed PWA that opted in.
 *
 * How it fits the free-tier stack: subscriptions live in Firestore
 * (`pushSubscriptions`), written by the browser through the same rules-guarded
 * REST API as everything else. This script signs in as the admin (the only role
 * the rules let read that collection), fans the message out to each subscriber
 * with the VAPID private key, and prunes any subscription the push service
 * reports as gone. No Cloud Functions, no billing, no Firebase Admin SDK.
 *
 * Setup (once):
 *   1. `npm run push:keys` prints a VAPID pair. Put the public key in
 *      src/config.ts (PUSH.publicKey) and VAPID_PUBLIC_KEY below-friendly env,
 *      and the private key in `.env` as VAPID_PRIVATE_KEY. Keep the same pair.
 *   2. In `.env`, set ADMIN_EMAIL / ADMIN_PASSWORD to the Firebase Auth admin
 *      account (the UID in src/config.ts ADMIN.uid) and VAPID_SUBJECT to a
 *      mailto: you own. `.env` is gitignored — the private key never ships.
 *
 * Send:
 *   npm run push:send -- --title "New article" --body "…" --url "/blog/slug"
 *   Optional: --image "/og/whatever.png"  --tag "release"  --require-interaction
 */

import webpush from 'web-push';

const PROJECT = 'msdevbuild-blog';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyC1oOQOPnd4i-6W0vXkhDHrzRAFYpd0nDk';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// The public key must be the one embedded in src/config.ts (PUSH.publicKey).
const VAPID_PUBLIC =
  process.env.VAPID_PUBLIC_KEY ||
  'BJdVP1Fm0wckAPotGdybEqQnxcrv9zWITDdq0PPU3MbtgvHxSMwWByudsKmQGr8eyG307zLamI0bu-8ZMLk6erI';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:jssuthahar@gmail.com';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** Minimal flag parser: `--key value` and boolean `--flag`. */
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function requireEnv() {
  const missing = [];
  if (!VAPID_PRIVATE) missing.push('VAPID_PRIVATE_KEY');
  if (!ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (missing.length) {
    console.error(`✗ Missing env: ${missing.join(', ')}.`);
    console.error('  Set them in .env and run: npm run push:send -- --title "…" --body "…"');
    process.exit(1);
  }
}

/** Sign in as the admin so the rules allow reading pushSubscriptions. */
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

/** Page through the whole pushSubscriptions collection. */
async function listSubscriptions(token) {
  const docs = [];
  let pageToken = '';
  do {
    const url = new URL(`${BASE}/pushSubscriptions`);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json();
    if (!res.ok) throw new Error(`List failed: ${body?.error?.message || res.status}`);

    for (const doc of body.documents || []) {
      const f = doc.fields || {};
      docs.push({
        name: doc.name, // full resource path, used to delete dead ones
        endpoint: f.endpoint?.stringValue,
        p256dh: f.p256dh?.stringValue,
        auth: f.auth?.stringValue,
      });
    }
    pageToken = body.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function deleteSubscription(token, name) {
  await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const title = args.title || args.t;
  const body = args.body || args.b || '';

  if (!title) {
    console.error('✗ A --title is required.');
    console.error('  npm run push:send -- --title "New article" --body "…" --url "/blog/slug"');
    process.exit(1);
  }

  requireEnv();
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  const token = await adminToken();
  const subs = await listSubscriptions(token);

  if (!subs.length) {
    console.log('No subscribers yet — nothing to send.');
    return;
  }

  const payload = JSON.stringify({
    title,
    body,
    url: args.url || args.u || '/',
    image: args.image,
    tag: args.tag,
    requireInteraction: Boolean(args['require-interaction']),
  });

  let sent = 0;
  let pruned = 0;
  let failed = 0;

  console.log(`Sending "${title}" to ${subs.length} subscriber(s)…`);

  // Send concurrently but in bounded batches so a big list stays polite.
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
          sent++;
        } catch (err) {
          // 404/410 mean the subscription is dead — remove it so the list
          // stays clean. Anything else is a transient send error.
          if (err.statusCode === 404 || err.statusCode === 410) {
            await deleteSubscription(token, sub.name);
            pruned++;
          } else {
            failed++;
            console.warn(`  ! ${err.statusCode || ''} ${err.body || err.message}`.trim());
          }
        }
      }),
    );
  }

  console.log(`✓ Delivered ${sent}, pruned ${pruned} dead, ${failed} failed.`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
