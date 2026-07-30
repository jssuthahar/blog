# Community features — how they work and what to switch on

Optional reader accounts, appreciations, badges and public developer profiles.
Everything runs on the Firebase **free (Spark) plan** and a static GitHub Pages
build. No Cloud Functions, no Cloud Storage, no paid service anywhere.

The rule the whole design bends around: **the article reading experience does not
change.** A signed-out reader's article page makes no extra requests, loads no
extra script file, and looks identical to before.

---

## What was built

| Piece | Where |
|---|---|
| Reader sessions, four sign-in providers | [src/lib/auth.ts](../src/lib/auth.ts) |
| Firestore access for readers (REST) | [src/lib/community.ts](../src/lib/community.ts) |
| Badge definitions (shared with the Node scripts) | [src/lib/badges.js](../src/lib/badges.js) |
| Sign-in page | [src/pages/signin.astro](../src/pages/signin.astro) |
| Profile editor, claim, delete account | [src/pages/profile.astro](../src/pages/profile.astro) |
| Public profile (prerendered) | [src/pages/u/\[handle\].astro](../src/pages/u/[handle].astro) |
| Public profile (client fallback) | [src/pages/u/index.astro](../src/pages/u/index.astro) |
| Appreciation write (inline, guarded) | [src/components/Reactions.astro](../src/components/Reactions.astro) |
| Badge evaluation (trusted) | [scripts/evaluate-badges.mjs](../scripts/evaluate-badges.mjs) |
| Public profile cache | [scripts/sync-profiles.mjs](../scripts/sync-profiles.mjs) |
| Nightly job | [.github/workflows/community.yml](../.github/workflows/community.yml) |
| Rules + tests | [firestore.rules](../firestore.rules), [scripts/test-rules.mjs](../scripts/test-rules.mjs) |
| Admin → **Readers** tab | [src/pages/admin.astro](../src/pages/admin.astro) |

---

## Setup — do these before it works

Four of these are console clicks nobody can do from the repo.

### 1. Publish the rules

```bash
firebase deploy --only firestore:rules
```

Everything below is refused until this runs. Verify the behaviour first with
`npm run test:rules`, which runs 27 cases against the Firestore emulator and
touches nothing real.

### 2. Enable the sign-in providers

Firebase Console → **Authentication → Sign-in method**:

- **Google** — a toggle.
- **GitHub** — create an OAuth App at github.com → Settings → Developer settings.
  Authorization callback URL: `https://msdevbuild-blog.firebaseapp.com/__/auth/handler`.
  Paste the client id and secret into Firebase.
- **Microsoft** — register an app in Entra ID (Azure portal → App registrations).
  Same redirect URI as above. Paste the application (client) id and a client
  secret into Firebase. This is the only provider with real setup work.
- **Email link (passwordless sign-in)** — a toggle, under the Email/Password
  provider. Passwordless is deliberate: no password to store or reset.

### 3. Authorise the site's domain

Authentication → **Settings → Authorized domains** → add `blog.msdevbuild.com`.

Sign-in fails with `auth/unauthorized-domain` until this is done. It is separate
from the API key's HTTP-referrer restriction in Cloud Console → Credentials,
which should also list the same domain.

### 4. Add the workflow secrets

The nightly job signs in as the admin account. In GitHub → Settings → Secrets →
Actions, confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD` exist — the push workflow
already uses the same two, so they are probably set.

---

## How a reader moves through it

1. Reads articles. No account, no prompt, nothing new on the page.
2. Reacts to an article. The public counter goes up, anonymously, as it always did.
3. Finds "Your profile" in the footer, signs in with one of four providers.
4. `/profile` offers to **claim** the reactions this browser made earlier, and
   mirrors the local reading history up to their account.
5. They pick a handle, write a bio and skills, and choose private (default) or public.
6. That night, the workflow recomputes their stats and badges, writes
   `src/data/profiles.json`, and commits it — which triggers a deploy, and
   `/u/<handle>/` goes live as real HTML.
7. Until that runs, their profile is reachable at `/u/?h=<handle>`, rendered in
   the browser and `noindex`.

Every later reaction is recorded against their account at click time.

---

## What is trustworthy and what is not

This matters for deciding what a badge should be based on.

| Signal | Trust | Why |
|---|---|---|
| `appreciations` with `source: 'live'` | **Solid** | Written at click time, server-stamped, one document per reader per article, id pinned to `uid__slug` by the rules. |
| `appreciations` with `source: 'claimed'` | Weak | Backfilled from the reader's own localStorage on first sign-in. Counts towards totals, never towards `first-appreciation`. |
| `progress` / `articlesRead` / series rings | Weak | Mirrored from localStorage and owner-written. There is no trusted client on a static site. Slugs that do not match a published article are dropped, and that is as far as verification can go. |
| `stats` / `badges` | **Solid** | Admin-write-only in the rules. Only the nightly job can write them. |

Badges marked `soft: true` in [badges.js](../src/lib/badges.js) are the ones
resting on self-reported evidence. That flag is documentation, not enforcement —
if a badge ever needs to be defensible, base it on live appreciations.

---

## Privacy decisions baked into the design

- **Profiles are private by default.** Publishing is an explicit choice.
- **Email addresses are never in the public profile document.** Firestore rules
  cannot hide a field — a public read returns everything, and the sync would bake
  it into static HTML. Addresses live in `profileContacts`, which only the reader
  and the admin can read.
- **Reading progress is never published**, only the count derived from it.
- **A reader can delete everything themselves** from `/profile` — documents first,
  then the Auth account. `stats/{uid}` is admin-only, so the nightly job prunes
  orphaned rows.
- **Thin profiles are not indexed.** A profile needs a bio and at least one skill
  before it earns a prerendered, indexable URL.

---

## Running things by hand

```bash
npm run test:rules        # 27 rules cases against the emulator (needs Java)
npm run community:badges  # recompute stats + badges  (needs .env admin creds)
npm run sync:profiles     # refresh src/data/profiles.json (same creds)
```

Or trigger **Community update** from the Actions tab to do both and commit.

---

## Turning it off

`COMMUNITY.enabled = false` in [src/config.ts](../src/config.ts) hides every
entry point, stops the article page recording anything, and leaves the pages in
place. The rules and the data are untouched.
