# Community engagement system — implementation plan

**Revised scope.** The reading experience does not change. We add four things only:
Firebase Authentication, appreciation tracking, badges, and public profiles.
Appreciations and badges are **login-only** — a signed-out reader can still react
exactly as they do today, but nothing is kept for them.

This is a much smaller build than the original ten-requirement version. The two
hardest pieces of that plan are gone: the anonymous-reaction rework (five new
reaction types, change/undo, `getAfter` rules, counter migration) and learning
paths. What remains fits the site as it stands.

---

## 1. Scope

**In**

1. Firebase Authentication — Google, Microsoft, GitHub, Email.
2. Appreciation tracking — a signed-in reader's reactions are recorded to their account.
3. Badge system.
4. Public developer profiles.

**Out (was in the previous draft)**

- Anonymous reaction identity / UUID model — not needed; appreciation now requires login.
- The five new reaction types, change-your-reaction, and the counter migration.
- Learning paths as a new content collection (see §7 for how the profile still shows learning progress without it).

**Untouched**

[src/components/Reactions.astro](src/components/Reactions.astro) keeps its four
keys, its increment-only counters, its localStorage guard, and its exact markup.
[firestore.rules](firestore.rules) `match /reactions/{slug}` is not edited. No
existing rule is loosened anywhere in this plan — everything is new collections.

---

## 2. The constraint, stated precisely

"The article reading experience does not change" needs one distinction, because
appreciation has to be captured *somewhere*:

- **No change to what a reader sees or does.** Identical DOM, identical layout, no
  new prompts, no new blocking script, nothing extra for a signed-out visitor.
  This is absolute.
- **One additive code path.** When — and only when — a session already exists in
  localStorage, the existing reaction click handler also writes a personal record.
  A signed-out reader's page is byte-identical to today's.

That distinction matters for trust. Recording at click time means an appreciation
is written when it actually happens. The alternative — reconstructing it later from
localStorage — is self-asserted and inflatable. I'd take the additive write.

**Where does someone sign in, then?** Not from the article. Recommended: a link in
[Footer.astro](src/components/Footer.astro) plus the `/profile` URL, and an avatar
in [Header.astro](src/components/Header.astro) **only when a session exists**. A
signed-out reader sees nothing new anywhere. (Decision 1 in §10 — a post-reaction
"sign in to keep this" nudge would convert far better, but it is a visible change.)

---

## 3. Authentication

The site has no Firebase SDK today — [src/lib/admin.ts](src/lib/admin.ts) talks to
Identity Toolkit over REST. Keep that posture: **load the Auth SDK lazily, only on
`/signin` and `/profile`.** Article pages stay SDK-free and their JS budget is
unchanged.

| Provider | Setup |
|---|---|
| Google | Console toggle. |
| GitHub | OAuth App on github.com → client id/secret into Firebase. |
| Email | Use **passwordless email link** — no password reset flow to build or store. |
| Microsoft | Needs an Azure AD (Entra ID) app registration. The only provider with real setup friction, and the one this audience most expects. |

Two hosting gotchas, both from GitHub Pages:

- Use **`signInWithPopup`, not `signInWithRedirect`.** The OAuth handler is on
  `msdevbuild-blog.firebaseapp.com`, a different site from `blog.msdevbuild.com`;
  Safari and Firefox block the third-party cookie `signInWithRedirect` relies on.
- Add `blog.msdevbuild.com` to **Authentication → Settings → Authorized domains**,
  and to the API-key HTTP-referrer restriction noted in [src/config.ts](src/config.ts).

Session storage reuses the `admin:session` shape already in
[src/lib/admin.ts](src/lib/admin.ts) under a separate key, so the admin console and
a reader account never collide in one browser.

---

## 4. Appreciation tracking

One document per user per article:

```
appreciations/{uid}__{slug}   { uid, slug, type, source, createdAt }
```

`type` is one of the four existing reaction keys, so the schema survives if the
five-type set arrives later. Rules: create/read/delete by owner (`uid ==
request.auth.uid`), read by admin, `createdAt == request.time` so it cannot be
backdated. The document ID makes a duplicate structurally impossible — that is the
same trick `eventRegistrations` already uses.

The public counters in `reactions/{slug}` keep working exactly as now, for
everyone. The appreciation record is a *parallel* write, not a replacement:

```
reaction click → existing counter increment (unchanged, everyone)
              → if session exists: write appreciations/{uid}__{slug}   (new)
```

If the second write fails, nothing visible happens — the counter already moved and
the page behaves as it does today.

**Backfill on first sign-in** (`source: 'claimed'`): the browser already holds
`reacted:{slug}:{key}` keys from past anonymous reactions. On first sign-in,
`/profile` offers to claim them. This is the "keep your appreciations" story for
existing readers — but it is self-asserted, so mark it `claimed` and let the badge
evaluator weight or ignore it. Click-time records carry `source: 'live'`.

---

## 5. Profiles

```
handles/{handle}         { uid }                    ← public read; ID claims the name
profiles/{uid}           { handle, name, photo, bio, skills[], linkedin, github, visibility }
profileContacts/{uid}    { email, provider }        ← admin-only, never public
stats/{uid}              { appreciations, articlesRead, badges[], series{}, updatedAt }
moderation/{uid}         { hidden, banned, note }   ← admin-only
```

Email is split out for the same reason `testimonialContacts` exists: **rules cannot
hide a field.** A public read of `profiles/{uid}` returns everything it holds, and
the sync would bake it into static HTML.

`photo` is a **URL string, never an upload.** Firebase Storage is deliberately not
used (§9.1) — the value defaults to the `photoURL` the OAuth provider already
returns (Google, GitHub and Microsoft all supply one), with an optional override
field for a self-hosted image. So the "upload a profile picture" affordance does
not exist, and nothing in this plan writes a byte of binary data.

`stats/{uid}` is **admin-write-only**, regenerated nightly. Users cannot award
themselves badges or edit their own counts.

Two rendering paths, since a static build can't have a page for someone who signed
up after it ran:

1. **Prerendered `/u/[handle]/`** from `src/data/profiles.json`, refreshed by a
   nightly `sync:profiles` Action — the same pattern as
   [sync-testimonials](scripts/sync-testimonials.mjs). Real HTML, `Person` JSON-LD,
   zero Firestore reads for visitors.
2. **Client fallback `/u/?h=handle`** for profiles newer than the last build,
   resolving `handles/{handle}` → `profiles/{uid}`. `noindex`; the prerendered page
   takes over at the next sync.

Handle uniqueness comes free from the document ID — a create against an existing
`handles/{handle}` fails, so the first claimant wins with no race.

`/profile` is the signed-in editor (`noindex`): name, photo, bio, skills, LinkedIn,
GitHub, visibility, claim-past-appreciations, and **delete my account** — the user
can do that themselves with `accounts:delete` plus owner-delete rules, which keeps
a real deletion path with no server.

**SEO guard.** Thin profiles hurt the domain. Only sync a profile into
`profiles.json` (and therefore the sitemap) when it has a bio, at least one skill,
and some activity. Generated titles and descriptions still have to clear
`npm run check:seo` pixel limits like every other page.

---

## 6. Badges

Definitions in `src/lib/badges.ts` — versioned, reviewable, testable — each
`{ id, label, description, icon, criteria(stats) }`. Starting set:
`first-appreciation`, `ten-appreciations`, `series-finisher`, `early-reader`,
`anniversary`.

Evaluation runs in a nightly GitHub Action signed in as the admin UID — the
free-tier substitute for Cloud Functions, and the same mechanism
[send-push.yml](.github/workflows/send-push.yml) already uses. It reads
`appreciations`, writes `badges[]` into `stats/{uid}`. Nothing client-side can
award a badge. Manual grants from `/admin` are stored as an override the evaluator
respects, so they survive the next run.

Trust note: `appreciations` with `source: 'live'` are solid — one document per
article per uid, rules-enforced, server-stamped. `claimed` and `articlesRead` are
self-asserted (see §7). Base the badges that matter on live appreciations.

---

## 7. "Articles read" and "learning progress" without touching articles

Requirement 7 lists both on the profile, and learning paths are now out of scope.
Both can still be filled without a single article-page edit:

[src/lib/reading-history.ts](src/lib/reading-history.ts) already records every
article opened, scroll progress, and completion in localStorage. `/profile` reads
that store on load and syncs it up:

```
progress/{uid}   { read: { slug: { pct, completedAt } } }   ← private, owner-only
```

The nightly Action turns it into the public `stats.articlesRead`. **Learning
progress** = percentage of each `series` (the collection that already exists in
[src/content/series/](src/content/series/)) whose articles are marked complete —
so the profile shows a real progress ring per series with no new content type and
no new tracking code.

Honest limit: this store is owner-written, so `articlesRead` is self-reportable.
There is no trusted client on a static site. The Action can apply sanity caps
(article must exist, ignore implausible bursts), which cleans up noise but not a
determined cheater. Keep the defensible badges on appreciations.

---

## 8. Admin

Your requirement list ended at "Admin can manage" — assuming it covers the four
features above, [/admin](src/pages/admin.astro) gets two new tabs on the existing
tabbed REST console:

- **Profiles** — list, hide/unhide, ban (via `moderation/{uid}`, checked in rules
  on write paths only), delete, view the private contact record.
- **Badges** — grant/revoke, holders per badge, plus appreciation totals per article.

`isAdmin()` already exists in the rules; the new collections reuse it unchanged.

---

## 9. Phasing and cost

| Phase | Delivers | Article pages touched |
|---|---|---|
| **1. Auth** | `/signin`, four providers, lazy Auth SDK, session module, footer/header entry points | none |
| **2. Appreciation** | `appreciations` collection + rules, additive write in the existing reaction handler, claim-on-sign-in | one additive branch, zero UX change |
| **3. Profiles** | `handles` / `profiles` / `profileContacts`, `/profile` editor, `sync:profiles` Action, `/u/[handle]/` + fallback, `Person` JSON-LD, delete-account | none |
| **4. Badges + admin** | `badges.ts`, nightly evaluator, `stats/{uid}`, two admin tabs, moderation rules | none |

Rules ship before the code that uses them, so nothing is ever live against
permissive rules.

**Free tier.** Spark allows 50k reads and 20k writes per day. This plan adds
**zero reads and zero writes for a signed-out reader** — their article page is
unchanged, and profile pages are served from the prerendered snapshot. A signed-in
reader adds one write per reaction. The nightly Action is the only bulk reader; if
`appreciations` grows past a few thousand documents it should page and checkpoint
rather than full-scan. Auth itself is free and unmetered for all four providers.

### 9.1 Free plan — what this never touches

Nothing here requires the Blaze plan. The four Firebase products that would have
forced billing, and how each is avoided:

| Would need billing | Used for | Instead |
|---|---|---|
| **Cloud Functions** | badge evaluation, stat rollups, anything on-write | Nightly GitHub Action signed in as the admin UID — the pattern [send-push.yml](.github/workflows/send-push.yml) already uses. Free for this repo. |
| **Cloud Storage** | profile photo upload | No upload at all. `photo` is a URL — the provider's `photoURL`, or a self-hosted override. Note: a Firebase project created after Oct 2024 cannot provision a Storage bucket on Spark anyway. |
| **Firebase Hosting** (beyond free quota) | serving the site | GitHub Pages, as today. |
| **Identity Platform** | SAML / OIDC / MFA | Not needed. Google, Microsoft, GitHub and email-link are all standard Firebase Auth providers on Spark, unmetered. Only phone/SMS sign-in is billed, and it is not in scope. |

Also unused: Firestore scheduled exports, Extensions, App Check enforcement (App
Check is free to enable but adds a provider dependency — see decision 6),
Remote Config, Analytics.

### 9.2 The one API key that cannot be avoided

**Firebase Authentication does not work without the Web API key.** Every Identity
Toolkit call — REST or SDK, anonymous or Google or email-link — takes
`?key=<apiKey>`. There is no keyless mode. If "no API" means "no API key in the
client", then requirement 6 is not buildable on Firebase at all, by anyone.

The practical position is that this is already settled here: the key is in
[src/config.ts](src/config.ts) for `/admin`, and Google documents it as a public
identifier rather than a secret — it identifies the project, it does not authorise
anything. `firestore.rules` remains the only thing standing between a caller and
the data. What the key does need is the **HTTP-referrer restriction** to
`blog.msdevbuild.com` in Cloud Console → Credentials, which the config comment
already calls for. Worth confirming it is actually applied before opening auth to
readers, since the referrer restriction is what stops the key being reused from
another origin.

No other API, third-party service, or paid endpoint appears anywhere in this plan.

---

## 10. Open decisions

1. **Sign-in entry point.** Recommended: footer link + header avatar only when
   signed in, so a signed-out reader sees nothing new. A post-reaction "sign in to
   keep this" prompt would convert far better — but it is a visible change to the
   article page, so it needs your explicit call.
2. **Claiming past reactions** — offer it (good for existing readers, self-asserted)
   or start everyone at zero on sign-up (clean, but the first thing a returning
   reader sees is an empty profile).
3. **Are profiles public by default?** Plan assumes opt-in, defaulting to private —
   a public profile plus an OAuth display name is personal data the reader did not
   obviously agree to publish. [privacy.astro](src/pages/privacy.astro) needs an
   update either way.
4. **Handles** — user-chosen (needs an impersonation/profanity check) or derived
   from the provider name with a numeric suffix.
5. **Admin scope** — confirm §8 matches what you meant by "admin can manage".
6. **App Check** — free to turn on and it would stop the API key being driven from
   a script, but it adds a reCAPTCHA/attestation provider to every page. Given the
   rules are already strict and the worst case is an inflated counter, my read is:
   skip it. Flagging it because it is the one free hardening step being left out.
