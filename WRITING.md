# Writing guide

Everything needed to publish a post, in one place. Copy the template, fill it in,
push.


---

## 1. Create the file

```
src/content/blog/secure-blazor-with-entra-id.md
```

**The filename becomes the URL** → `blog.msdevbuild.com/blog/secure-blazor-with-entra-id`

Lowercase, hyphen-separated, no dates in the name. Once published, don't rename it —
the URL is what search engines and inbound links point at.

Use `.md` for a normal post. Use **`.mdx`** only when you need video or callouts
(see sections 4 and 5).

---

## 2. Frontmatter

Everything between the `---` markers at the top.

```yaml
---
title: 'How to Secure a Blazor App with Microsoft Entra ID'
description: 'Wiring Entra ID into a Blazor Server app — token handling, protected routes, and the configuration that silently breaks in production.'
highlight: 'Register the OpenID Connect handler before authorization, protect routes at the layout level rather than per page, and keep the client secret in Key Vault. The failure most teams hit is a redirect URI mismatch that only appears after deployment.'
publishedAt: 2026-07-24
category: azure
tags: ['Blazor', 'Entra ID', 'Authentication', '.NET']
draft: false
---
```

### Required

| Field | Rules |
| --- | --- |
| `title` | Max 120 characters |
| `description` | **50–200 characters.** Used for the card, the meta description, and RSS |
| `publishedAt` | `YYYY-MM-DD` |
| `category` | Exactly one of: `programming` `mobile` `azure` `ai` `copilot` `architecture` `devops` `engineering` `career` |

### Optional

| Field | What it does |
| --- | --- |
| `highlight` | The box at the top of the post. Falls back to `description`. Max 400 chars |
| `updatedAt` | Shows "Updated {date}" — a genuine freshness signal for search |
| `tags` | Free text array. Drives `/tag/…` pages |
| `featured: true` | Promotes it to the home page hero card |
| `draft: true` | Visible in `npm run dev`, **excluded from the live site** |
| `series` + `seriesOrder` | Multi-part guides. Both required together |
| `cover` + `coverAlt` | Cover image. Both required together |
| `faq` | Renders a FAQ section **and** emits `FAQPage` schema for rich results |
| `redirectFrom` | Old Blogger URLs, e.g. `['/2023/05/old-post.html']` |
| `seoTitle` | Override the `<title>` only (max 70 chars) |

**A mistake here fails the build rather than shipping.** Wrong category, missing
`coverAlt`, a 20-character description — `npm run build` stops and says which field.

---

## 3. Images

### Cover image

Put the file beside the post, then reference it **relatively**:

```
src/content/blog/
├─ secure-blazor-with-entra-id.md
└─ images/
   └─ entra-id-flow.png
```

```yaml
cover: './images/entra-id-flow.png'
coverAlt: 'Diagram of the Entra ID authentication flow for a Blazor Server app'
```

`coverAlt` is **required** whenever `cover` is set — the build refuses otherwise.

Aim for **1200×630** — the size cards and share images are cropped to. A
screenshot of the thing you built beats a diagram of it.

**No cover image still works.** Posts without one show their own share card —
title, category, and the MSDEVBUILD wordmark, drawn at build time by
`src/lib/og-card.ts`, the same image LinkedIn and X show when the post is
shared. Nothing looks empty, but the fallback is a stand-in, not the goal:

```bash
npm run check:covers          # published posts still on the fallback
npm run check:covers -- --all # drafts too
```

It never blocks a build. It does flag a `cover:` that points at a missing file,
one under 1200px wide, or one shaped so differently from 1200×630 that the card
crop cuts into it.

### Images inside the article

Same folder, standard Markdown:

```markdown
![The app registration screen with the redirect URI highlighted](./images/app-registration.png)
```

Relative paths get **optimised at build time** — Astro emits AVIF/WebP at several
widths and adds `width`/`height` so the page doesn't shift while loading.

A path starting with `/` (from `public/`) is served **as-is, unoptimised**. Only use
that for things that must keep an exact filename.

### Image rules of thumb

| | |
| --- | --- |
| Cover width | ~1600px |
| In-article width | ~1200px max |
| Screenshots | PNG |
| Photos | JPG |
| Alt text | Always. Describe what it shows, not "screenshot" |

**Watch the repo size.** GitHub Pages caps the published site at **1 GB** and every
image counts. Compress before committing. If it ever gets close, images move to a
separate `blog-images` repo served over jsDelivr.

### Captions

```markdown
<figure>
  <img src="./images/entra-id-flow.png" alt="Entra ID authentication flow" />
  <figcaption>The token never reaches the browser in Blazor Server.</figcaption>
</figure>
```

---

## 4. Video

Rename the file to **`.mdx`**, then import the component:

```mdx
---
title: '...'
---
import YouTube from '../../components/mdx/YouTube.astro';

Here is the walkthrough:

<YouTube id="dQw4w9WgXcQ" title="Securing Blazor with Entra ID" />
```

`id` is the 11 characters after `v=` in the YouTube URL — not the whole link.
`start={90}` begins at 1:30.

It renders the thumbnail and only loads the player **on click**. A plain `<iframe>`
would pull ~1 MB of YouTube JavaScript and set cookies on every page view, even for
readers who never press play.

---

## 5. Callouts

Also `.mdx`:

```mdx
import Callout from '../../components/mdx/Callout.astro';

<Callout type="warning">
  `ClockSkew` defaults to five minutes, so an expired token keeps working.
</Callout>
```

`type` is `note` (default), `tip`, or `warning`. `title="Custom heading"` overrides
the label.

---

## 5b. The reference project

Code samples come from **one real app** wherever the topic allows it — the
MSDevBuild Eats Flutter food delivery project — so readers follow a working
implementation instead of isolated snippets.

| | |
| --- | --- |
| Source | <https://github.com/jssuthahar/food-delivery-app> |
| Live web | <https://jssuthahar.github.io/food-delivery-app/> |
| Android build | <https://appdistribution.firebase.dev/i/00432c5aa60de58b> |

Put the three links near the top of the post in a `<Callout type="tip">`, use
real file paths from the repo, and give the reader something to run. Full
guidance, including when *not* to use it: [`docs/REFERENCE-PROJECT.md`](docs/REFERENCE-PROJECT.md).

---

## 6. Writing the body

Plain Markdown below the frontmatter.

````markdown
Blazor Server keeps component state on the server, which changes how
authentication behaves compared with a SPA.

## How does the authentication flow work?

Answer in the first two sentences, then explain.

```csharp
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));
```

| Mistake | Symptom |
| --- | --- |
| Redirect URI mismatch | `AADSTS50011` after deploy |

## Key takeaways

- One point per line.
````

Code blocks get syntax highlighting and a copy button automatically. Name the
language after the opening fence.

### Structure that gets found and quoted

Search engines and AI assistants slice a page into passages, so each section has to
stand alone:

1. **`##` headings as real questions** — "How do you secure a Blazor route?"
2. **Answer first**, explain second. The first two sentences of a section get quoted.
3. **Tables for comparisons** — highly extractable.
4. **Fill in `faq:`** — renders on the page and emits schema.
5. **End with "Key takeaways".**

Don't write a `**TL;DR**` line at the top — `highlight` already does that job, and
having both repeats the same text twice.

---

## 7. Preview and publish

```bash
npm run dev      # http://localhost:4321 — drafts visible
npm run build    # fails loudly on bad frontmatter
```

Then commit and push to `main`. GitHub Actions builds and deploys automatically.

### Before pushing

- [ ] `description` is 50–200 characters and reads well as a search result
- [ ] `highlight` states the answer, not the topic
- [ ] Every image has real alt text
- [ ] `category` is one of the six
- [ ] `draft: false`
- [ ] `npm run build` passes

---

## 8. Full template

Copy [`docs/post-template.mdx`](docs/post-template.mdx) into
`src/content/blog/`, rename it, and delete what you don't need.
