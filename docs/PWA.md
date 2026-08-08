# PWA — offline, install, and push notifications

The site is an installable Progressive Web App with offline support and Web Push
notifications. It stays on the free tier: no Cloud Functions, no billing. Push
subscriptions live in the same Firestore already used for views and subscribers,
and sends are fanned out from a local script.

## What ships

| Piece | File | Job |
| --- | --- | --- |
| Web app manifest | `public/manifest.webmanifest` | Makes the site installable; standalone launch; icons, shortcuts. |
| Service worker | `public/sw.js` | Offline caching + receives Web Push + routes notification clicks. |
| Offline screen | `public/offline.html` | Self-contained fallback when a page isn't cached. |
| Icons | `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | App icons (maskable for Android). |
| Runtime | `src/components/PwaController.astro` | Registers the SW, shows Install + Enable-notifications UI. |
| Subscribe logic | `src/lib/push.ts` | Permission + `PushManager.subscribe`, stores the subscription in Firestore. |
| Compose UI | `/admin` → **Notify** tab | Where you write and queue a notification by hand. |
| Auto-announce | `scripts/announce-new-posts.mjs` + the `announce` job in `.github/workflows/deploy.yml` | Queues a notification for each newly published article, automatically, after every deploy. |
| Outbox → send | `pushOutbox` collection + `scripts/drain-push-outbox.mjs` + `.github/workflows/send-push.yml` | Queued notifications are sent by a scheduled GitHub Action. |
| Manual sender | `scripts/send-push.mjs` | Optional: send one immediately from a terminal. |
| Keygen | `scripts/push-keys.mjs` | Prints a fresh VAPID key pair. |

## How offline works

- **Pages (HTML)** — network-first. Online, you always get the freshest deploy;
  offline, you get the last-seen copy of that page, or `offline.html` if it was
  never visited. (Network-first is also why a new deploy is never stuck behind a
  stale service worker.)
- **Hashed assets** (`/_astro/…`, fonts, images) — stale-while-revalidate. The
  filename changes when the content does, so a cached copy is never wrong.

## Install

- **Android / desktop Chrome / Edge** — the browser fires `beforeinstallprompt`;
  the app shows an **Install app** button that triggers the native prompt.
- **iOS / iPadOS (Safari)** — there is no install API, so the button opens a
  short **Add to Home Screen** guide. Launched from the home-screen icon, the
  site runs standalone (no browser chrome).

## Push notifications

Standard VAPID Web Push — the same mechanism on Android and on iOS 16.4+ (iOS
only delivers to an **installed** PWA, so the UI asks iOS users to install
first).

### Why sending is a GitHub Action, not the browser

Signing a Web Push requires the VAPID **private key**. The `/admin` page is
static JavaScript anyone can download, so a key placed there would be published —
anyone could then send notifications as you. So the admin page only *queues* the
message (to `pushOutbox`, which the rules let the admin write); a GitHub Action
holding the private key as a **secret** does the actual send. No key ever reaches
the browser, and there's no `.env` to manage.

### One-time setup

1. **Publish the Firestore rules** — `firestore.rules` gained `pushSubscriptions`
   and `pushOutbox` blocks. Publish them in the Firebase console (the local CLI is
   logged in under a different account). Until live, subscribing and queuing fail.

2. **Add three GitHub Actions secrets** — repo **Settings → Secrets and variables
   → Actions → New repository secret**:
   - `VAPID_PRIVATE_KEY` — the private half of the pair whose public half is in
     `src/config.ts` (`PUSH.publicKey`). The working value is in `.env` locally;
     copy it into the secret. (Regenerate both with `npm run push:keys` only if it
     ever leaks — that invalidates every existing subscription.)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the Firebase Auth admin account (the UID
     in `ADMIN.uid`). The Action signs in as the admin to read subscribers, which
     the rules expose to the admin only.

   (`.env` is only needed for the optional local `npm run push:send`. If you send
   solely from `/admin`, you can delete `.env` — the secrets above are what the
   Action uses.)

### Sending — automatically, when an article goes live

Nothing to do. After every deploy to `main`, the `announce` job scans
`src/content/blog` and queues a notification for each article that is published,
not a draft, and hasn't been announced before. Title and message come from the
article's own `title` and `description`; the click target is `/blog/<slug>`. The
job runs **after** the Pages deploy finishes, so the link is never a 404, and it
is `continue-on-error` — a Firestore hiccup can't turn a good deploy red.

Two guards stop it ever mass-mailing:

- **Publish window** (`--days`, default 7) — only genuinely recent posts qualify,
  so an old article edited today does not re-announce.
- **Batch cap** (`--max`, default 3) — more than three un-announced posts at once
  looks like a bulk import or a back-dated `publishedAt`, so the job stops and
  says so instead of firing a dozen notifications.

Repeat runs are safe: the outbox document id is `post-<slug>` and the write
carries an `exists: false` precondition, so an article can only ever be queued
once.

Check what would go out, without credentials and without writing anything:

```bash
npm run push:announce:dry
```

**One-time setup.** The existing archive predates this, so record it all as
already-announced before the first real deploy — this writes the rows and closes
them immediately, delivering nothing:

```bash
npm run push:announce -- --seed --days 3650
```

Do that when the send workflow isn't mid-drain; the queue and close are
milliseconds apart, but a drain landing exactly between them would deliver that
row for real.

### Sending — from `/admin`

Open **/admin → Notify**, write a title / message / link, and press **Queue
notification**. The tab shows how many installed apps it will reach, and each row
flips to **sent** with a delivery count once the Action runs. Delivery is within a
few minutes (the workflow runs on a 5-minute cron). To send *now* instead of
waiting, open the repo's **Actions → Send push notifications → Run workflow**.

### Sending — from a terminal (optional)

If you'd rather send instantly from your machine, fill `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in `.env` and:

```bash
npm run push:send -- --title "New article: Copilot agent mode" \
  --body "A field guide to agent mode and MCP." \
  --url "/blog/copilot-agent-mode"
```

Options: `--url` (click target, default `/`), `--image`, `--tag` (groups/replaces
prior notifications), `--require-interaction`. Both paths deliver to every
subscriber and prune any subscription the push service reports as gone (404/410).

## Notes

- `beforeinstallprompt` and Web Push both require HTTPS — they work on
  `blog.msdevbuild.com`, not over plain `localhost` for push (localhost is
  treated as secure for the service worker, but iOS push needs the installed
  app).
- Bump `CACHE_VERSION` in `public/sw.js` if the caching logic changes, to evict
  old caches on the next activate.
