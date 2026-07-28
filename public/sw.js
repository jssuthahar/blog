/*
 * MSDEVBUILD service worker — offline support + Web Push.
 *
 * Two jobs:
 *   1. Make the site work offline. HTML uses network-first (so a new deploy is
 *      always seen when online, and the last-seen page or a friendly offline
 *      screen shows when not). Hashed build assets use stale-while-revalidate —
 *      their filename changes when their content does, so a cached copy is never
 *      wrong and updates land silently in the background.
 *   2. Receive Web Push and turn it into a notification, and route a click to
 *      the right page. Standard VAPID push — no Firebase SDK, works the same on
 *      Android and (installed, iOS 16.4+) Safari.
 *
 * Bump CACHE_VERSION whenever this file's caching logic changes so old caches
 * are cleaned out on activate.
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `msdevbuild-static-${CACHE_VERSION}`;
const PAGES_CACHE = `msdevbuild-pages-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// The minimum needed to render *something* offline. Everything else is cached
// lazily as it is requested. These are stable filenames, safe to precache.
const PRECACHE = [OFFLINE_URL, '/manifest.webmanifest', '/favicon.svg', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // A fresh worker should take over as soon as it is ready rather than
      // waiting for every tab to close first.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Let the page tell a waiting worker to activate immediately (used by the
// "update available" flow in the registration script).
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

const isHashedAsset = (url) =>
  url.pathname.startsWith('/_astro/') ||
  url.pathname.startsWith('/fonts/') ||
  /\.(?:css|js|woff2?|png|jpe?g|svg|webp|avif|ico)$/.test(url.pathname);

// Hashed static assets: serve from cache instantly, refresh in the background.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

// Pages: network-first so an online visit is always fresh, then fall back to
// the cached copy, then to the offline screen. Crucially, this caches the HTML
// however it was loaded — a full navigation OR the client router's own fetch of
// the next article — so anything read online stays readable offline.
async function pageStrategy(request) {
  try {
    const response = await fetch(request);
    const type = response.headers.get('content-type') || '';
    if (response.ok && (request.mode === 'navigate' || type.includes('text/html'))) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // A refresh with no cached copy shows the offline screen. A failed router
    // fetch instead rejects, so Astro falls back to a real navigation (which
    // then hits this same path and gets the offline screen).
    if (request.mode === 'navigate') return caches.match(OFFLINE_URL);
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only ever handle same-origin GETs. Analytics, ads, Firestore, and every
  // other cross-origin call must pass straight through untouched.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(isHashedAsset(url) ? staleWhileRevalidate(request) : pageStrategy(request));
});

/* ---------------------------------------------------------------- Web Push -- */

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'MSDEVBUILD', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'MSDEVBUILD';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: '/icon-192.png',
    image: payload.image,
    // Grouping tag so repeat pushes replace rather than stack; renotify makes
    // a replacement still alert the user.
    tag: payload.tag || 'msdevbuild',
    renotify: true,
    // The click target rides along so notificationclick knows where to go.
    data: { url: payload.url || '/', ...(payload.data || {}) },
    requireInteraction: Boolean(payload.requireInteraction),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an already-open tab on the same page instead of opening a new one.
      for (const client of clients) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      // Otherwise reuse any open tab, navigating it, or open a fresh window.
      for (const client of clients) {
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(target).then((c) => c && c.focus());
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
