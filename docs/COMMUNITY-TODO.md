# Community features — TODO

The code is built, type-checked and rules-tested. Nothing below is code work
except where marked — it is the console clicks, the deploy, and the two decisions
still open.

Reference: [COMMUNITY.md](COMMUNITY.md) for how it all works.

---

## 1. Blocking — nothing works until these are done

- [ ] **Publish the Firestore rules.**
      `firebase deploy --only firestore:rules`
      The CLI account currently signed in has no permission on `msdevbuild-blog`
      (it returns 403 on `serviceusage`), so sign in as the owning Google account
      first, or publish by pasting `firestore.rules` into
      Firebase Console → Firestore → Rules → **Publish**.
      Editing without publishing does nothing.

- [ ] **Enable Google sign-in.**
      Console → Authentication → Sign-in method → Google → enable.

- [ ] **Enable GitHub sign-in.**
      github.com → Settings → Developer settings → OAuth Apps → New.
      Callback URL: `https://msdevbuild-blog.firebaseapp.com/__/auth/handler`
      Paste client id + secret into Firebase.

- [ ] **Enable Microsoft sign-in.**
      Azure portal → Entra ID → App registrations → New registration.
      Redirect URI (type: Web): `https://msdevbuild-blog.firebaseapp.com/__/auth/handler`
      Create a client secret, paste id + secret into Firebase → Microsoft provider.
      *This is the only provider with real setup work — budget 15 minutes.*

- [ ] **Enable email-link sign-in.**
      Console → Authentication → Sign-in method → Email/Password → enable, then
      tick **Email link (passwordless sign-in)**. Passwordless is deliberate:
      there is no password to store and no reset flow in the code.

- [ ] **Authorise the domain.**
      Authentication → Settings → Authorized domains → add `blog.msdevbuild.com`.
      Without it every sign-in fails with `auth/unauthorized-domain`.

- [ ] **Confirm the API key referrer restriction.**
      Cloud Console → APIs & Services → Credentials → the browser key →
      HTTP referrers should list `blog.msdevbuild.com/*`. The key is a public
      identifier, but the referrer restriction is what stops it being driven from
      another origin — and it matters more now that readers can sign in.

- [ ] **Confirm the workflow secrets exist.**
      GitHub → Settings → Secrets and variables → Actions:
      `ADMIN_EMAIL`, `ADMIN_PASSWORD`. The push workflow already uses both, so
      they are probably set — the nightly **Community update** job needs the same two.

---

## 2. Verify once it is live

Smoke test in this order; each step depends on the one before.

- [ ] Open an article **signed out**. Reactions still work, counts still move.
      DevTools → Network shows no new request versus before.
- [ ] Footer → **Your profile** → **Sign in** → try **each** of the four providers.
      Popup opens (not a redirect), and you land back on `/profile/`.
- [ ] On `/profile/`, claim past reactions if offered, set a handle, add a bio and
      a skill, save as **public**.
- [ ] `/u/?h=<your-handle>` renders your profile client-side straight away.
- [ ] Go back to an article and react. Firestore → `appreciations` shows one
      document `<uid>__<slug>` with `source: 'live'`.
- [ ] Actions tab → run **Community update** by hand. It should write `stats/<uid>`,
      commit `src/data/profiles.json`, and trigger a deploy.
- [ ] After that deploy, `/u/<your-handle>/` is a real prerendered page.
- [ ] `/admin` → **Readers** tab lists you, shows your private email, and the
      hide / ban / badge buttons work.
- [ ] Delete a throwaway test account from `/profile/` and confirm the documents
      are gone and the next nightly run prunes its `stats` row.

---

## 3. Decisions still open

- [ ] **Where the sign-in entry point lives.** *(code — ~20 min either way)*
      Today there is **no visible sign-in button for a signed-out reader**: only a
      footer "Your profile" link, and a header chip that stays hidden until a
      session exists. That was the strict reading of "the reading experience does
      not change". Two alternatives:

      **(a) Header "Sign in" link** — next to the theme toggle, shown only when
      signed out, swapping to the chip once signed in. Visible on every page,
      including articles.

      **(b) Post-reaction nudge** — after a signed-out reader reacts, one line
      appears under the buttons: *"Sign in to keep this."* Far higher conversion,
      because it arrives at the moment they have shown intent. It is also a
      visible change to the article page, so it needs an explicit yes.

      Without one of these, expect close to zero sign-ups.

- [ ] **App Check.** Free, and it would stop the API key being driven from a
      script — but it puts a reCAPTCHA/attestation provider on every page. Current
      call: skip it, since the rules are strict and the worst case is an inflated
      counter. Flagged so the omission is deliberate rather than forgotten.

- [ ] **Handle squatting.** Handles are first-come, first-served with a small
      reserved list in `firestore.rules` (`admin`, `suthahar`, `msdevbuild`, …).
      Add any other names worth protecting before readers start claiming them —
      changing the list later does not release handles already taken.

---

## 4. Known limits — accepted, not bugs

- **`articlesRead` and series rings are self-reported.** Reading progress is
  owner-written; there is no trusted client on a static site. The evaluator drops
  slugs that do not match a published article, and that is as far as verification
  goes. Badges resting on this are flagged `soft: true` in `src/lib/badges.js`.
- **Badges lag by up to a day.** No Cloud Functions on the free plan, so awarding
  happens in the nightly job. Run the workflow by hand to award sooner.
- **A new public profile is not indexable until the next sync.** The client
  fallback covers it in the meantime, and is `noindex` on purpose.
- **Thin profiles never get a prerendered URL.** A bio and at least one skill are
  required, so near-empty pages cannot drag the domain down in search.
- **The OAuth popup flow has not been tested end to end.** It needs section 1
  finished and a browser on the live domain. It is the one part of this work not
  exercised.

---

## 5. Later, if the features get used

- [ ] Paginate `evaluate-badges.mjs` with a checkpoint once `appreciations` passes
      a few thousand documents — it full-scans today, which is fine at this size
      but will eventually eat into the 50k/day read budget.
- [ ] A `/u/` index listing public profiles, once there are enough to be worth a page.
- [ ] Reader count on the admin dashboard alongside installs and subscribers.
