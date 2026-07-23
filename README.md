# blog.msdevbuild.com

The MSDEVBUILD blog — static Astro site, deployed to GitHub Pages.
The main site lives separately at [www.msdevbuild.com](https://www.msdevbuild.com);
this repo only owns the `blog.` subdomain.

## DNS

A subdomain needs one CNAME record — not the four apex A records GitHub Pages
documents for root domains:

```dns
CNAME   blog   jssuthahar.github.io.
```

Then set the custom domain to `blog.msdevbuild.com` in **Settings → Pages** and
enable **Enforce HTTPS**. [`public/CNAME`](public/CNAME) keeps that setting from
being wiped on each deploy.

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` (drafts visible) |
| `npm run build` | Production build to `dist/` (drafts excluded) |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check content schema and components |
| `npm run sync:articles` | Refresh the main-site article list from its Blogger feed |

## Articles from the main site

[`/articles`](src/pages/articles.astro) lists every article published on
`www.msdevbuild.com`, read from its Blogger feed.

The feed is fetched by [`scripts/sync-blogger.mjs`](scripts/sync-blogger.mjs)
into a **committed** cache at `src/data/articles.json`, rather than fetched
during the build or from the browser. Three reasons:

- Blogger sends no CORS headers, so a browser-side fetch would fail.
- A client-rendered list is invisible to search engines and AI crawlers — the
  whole point of this site is that content is in the initial HTML.
- A committed cache means a feed outage cannot break a deploy, and a fresh
  clone builds offline.

`.github/workflows/sync-articles.yml` re-runs the sync weekly and commits only
when the feed actually changed. Run `npm run sync:articles` to update it by hand.

## Writing a post

Create `src/content/blog/my-post-slug.md`. The filename becomes the URL:
`/blog/my-post-slug`.

```yaml
---
title: 'How to Do the Thing in .NET'
description: 'One or two sentences, 50-200 chars. Used for cards, meta description, and RSS.'
publishedAt: 2026-07-23
updatedAt: 2026-08-01        # optional, but a strong freshness signal
category: dotnet             # dotnet | csharp | azure | ai | devops | career
tags: ['ASP.NET Core', 'EF Core']
cover: './images/my-post.png'   # optional, relative to the post
coverAlt: 'Description of the image'
series: 'minimal-api-production'  # optional
seriesOrder: 3                    # required if series is set
draft: false
featured: false
redirectFrom: ['/2023/05/old-blogger-url.html']   # for migrated posts
faq:
  - q: 'A question a reader would actually search for'
    a: 'A direct, self-contained answer.'
---
```

The build fails on a bad schema, so a typo in frontmatter can never reach production.

### Structure that ranks and gets cited

The template exists because retrieval systems slice pages into passages, and each
passage has to stand on its own:

1. Open with a **TL;DR** paragraph — this is what gets quoted.
2. Phrase `##` headings as real questions.
3. Answer in the first two sentences of a section, then explain.
4. Use tables for comparisons.
5. Fill in `faq:` — it renders on the page *and* emits `FAQPage` schema.
6. Close with **Key takeaways**.

## What is generated automatically

- `/blog/<slug>.md` — clean Markdown twin of every post, linked from the HTML
  via `<link rel="alternate">`, for AI crawlers that do not run JavaScript
- `/llms.txt` — Markdown index of the whole site for LLMs
- `/rss.xml` — feed, and the trigger for newsletter automation
- `/robots.txt` — explicitly allows AI crawlers
- `/sitemap-index.xml`
- JSON-LD: `BlogPosting`, `BreadcrumbList`, `FAQPage`, `Person`, `WebSite`

## Configuration

Everything site-wide lives in [`src/config.ts`](src/config.ts). Features stay
dormant until their config is filled in:

| Setting | Enables |
| --- | --- |
| `GA_ID` | Google Analytics 4 |
| `FIREBASE.projectId` | View counters (Firestore REST, no SDK shipped) |
| `GISCUS.repoId` / `categoryId` | Comments |
| `NEWSLETTER.action` | Email subscribe form |

## Deployment

Push to `main` → GitHub Actions builds and publishes to GitHub Pages.
Custom domain is set by [`public/CNAME`](public/CNAME).

Firestore rules for the view counter live in
[`firestore.rules`](firestore.rules) and deploy separately with
`firebase deploy --only firestore:rules`.
