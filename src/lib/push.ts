import { FIREBASE, PUSH } from '../config';

/**
 * Web Push subscribe/unsubscribe, stored in Firestore.
 *
 * Mirrors subscribe.ts: the browser talks to the Firestore REST API directly,
 * unauthenticated, and firestore.rules decides what a write may do. A push
 * subscription is a public-key encryption target, not a secret — the sender
 * (scripts/send-push.mjs) reads these back with the admin token and signs each
 * send with the VAPID private key that never leaves the server.
 */

export const PUSH_ENABLED_KEY = 'push:subscribed';

/** True when a VAPID key is configured and the browser can do Web Push. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    PUSH.publicKey.length > 0 &&
    FIREBASE.projectId.length > 0 &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** iOS only delivers push to an installed (home-screen) PWA, not Safari tabs. */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes this non-standard flag instead of display-mode.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as a Mac; the touch check disambiguates.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// A VAPID public key is base64url; PushManager wants it as raw bytes. Returns
// an ArrayBuffer so the type is unambiguously a BufferSource for subscribe().
function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalised = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalised);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return buffer;
}

// A stable, collision-free document id derived from the endpoint, so a repeat
// subscribe is a no-op instead of a duplicate row (same idea as the email id in
// subscribers). The endpoint itself can be long and contains `/`, which cannot
// live in a document id — a hex SHA-256 can.
async function endpointId(endpoint: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function keyToBase64(sub: PushSubscription, name: PushEncryptionKeyName): string {
  const key = sub.getKey(name);
  if (!key) return '';
  return btoa(String.fromCharCode(...new Uint8Array(key)));
}

async function saveSubscription(sub: PushSubscription): Promise<void> {
  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;
  const docId = await endpointId(sub.endpoint);

  const res = await fetch(`${base}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `projects/${FIREBASE.projectId}/databases/(default)/documents/pushSubscriptions/${docId}`,
            fields: {
              endpoint: { stringValue: sub.endpoint },
              p256dh: { stringValue: keyToBase64(sub, 'p256dh') },
              auth: { stringValue: keyToBase64(sub, 'auth') },
              ua: { stringValue: navigator.userAgent.slice(0, 300) },
            },
          },
          // Upsert: re-subscribing with a rotated key updates the same doc
          // rather than failing on an exists:false precondition.
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
}

/**
 * Ask permission, subscribe to Web Push, and store the subscription.
 * Resolves true on success; throws 'denied' / 'unsupported' / 'not-installed'
 * so the caller can show the right message.
 */
export async function enablePush(): Promise<boolean> {
  if (!isPushSupported()) throw new Error('unsupported');

  // On iOS, PushManager exists but only actually delivers when installed.
  if (isIos() && !isStandalone()) throw new Error('not-installed');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('denied');

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToBuffer(PUSH.publicKey),
    }));

  await saveSubscription(sub);
  localStorage.setItem(PUSH_ENABLED_KEY, '1');
  return true;
}

/** Unsubscribe locally. The stale Firestore doc is pruned by the sender on the
 *  next 404/410, so no delete is attempted from the unauthenticated client. */
export async function disablePush(): Promise<void> {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  localStorage.removeItem(PUSH_ENABLED_KEY);
}

/** Current subscription state, for reflecting the toggle on load. */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.ready;
  return (await reg.pushManager.getSubscription()) !== null;
}
