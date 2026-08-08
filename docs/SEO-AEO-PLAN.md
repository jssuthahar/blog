# SEO and AEO plan — the nine target pillars

Target pillars: **Azure**, **Azure AI**, **Azure AI Foundry**, **GitHub Copilot**,
**Flutter**, **Design Patterns**, **Technical Architecture**, **Programming
Learning**.

This plan is measured against what is actually published, not what is written.
Numbers below come from `src/content/blog` on 2026-08-08.

## 1. Where the site actually stands

43 blog posts exist. **17 are published; 26 are drafts.** Of the 17 published,
**14 are GitHub Copilot posts.**

| Pillar | Published | Drafts ready | Reality |
|---|---|---|---|
| GitHub Copilot | 14 | 4 | The only pillar that can rank today |
| Azure AI Foundry | **0** | 12 | A complete series sitting unpublished |
| Azure / Azure Cloud | 1 | 12 (shared) | One Bicep post, categorised under Copilot |
| Azure AI | 1 | 12 (shared) | Only `azure-openai-rag-dotnet.md`, 649 words |
| Flutter | 1 | 6 | One post, and it is really a Copilot Skills post |
| Technical Architecture | **0** | 3 | Only ever a secondary category |
| Design Patterns | **0** | 0 | 1 short video, no article |
| Programming Learning | 3 thin | 0 | 408, 636 and 649 words |

Seven of the nine pillars have no meaningful published presence. Search engines
and answer engines currently know this site as a GitHub Copilot site.

## 2. The one move that outranks everything else

**Publish the two finished series.** They are written, they pass the build, and
they are the missing pillars:

- `azure-ai-foundry-agents` — 12 parts, all `draft: true`. Covers Foundry setup,
  agents, function tools, MCP, JWT/Entra security, multi-agent handoff,
  streaming, Flutter client, monitoring. This *is* the Azure + Azure AI + Azure
  AI Foundry cluster.
- `ai-agent-team` — 10 parts, all `draft: true`. Covers planning/architect
  agents, Flutter + Firebase, testing, security, DevOps, accessibility.
  This carries Flutter and Technical Architecture.

Publishing these takes the site from 17 to 39 indexable posts and from one
pillar to five. No amount of meta-tag work competes with that. Everything below
assumes it happens first.

Publish them on a **schedule, not in one batch** — two or three per week per
series, so the crawl looks like an active publication rather than a dump.

## 3. Cluster architecture

Nine requested pillars collapse into six clusters, and all six already exist as
category slugs in `src/lib/taxonomy.ts`. No taxonomy change is needed.

| Cluster | Category slug | Hub page | Head term to own |
|---|---|---|---|
| GitHub Copilot | `copilot` | Series hub | "GitHub Copilot Skills", "AGENTS.md" |
| Azure AI Foundry | `azure` | Series hub | "Azure AI Foundry agents" |
| Azure Cloud | `azure` | Category page | "Azure managed identity Bicep" |
| Flutter + Firebase | `mobile` | Category page | "Flutter BLoC Firebase architecture" |
| Architecture + Design Patterns | `architecture` | **Missing** | "design patterns C#", "clean architecture .NET" |
| Programming Learning | `programming` | **Missing** | ".NET learning roadmap" |

Two structural problems block this:

**a. There is one 18-part mega-series holding two different clusters.**
`agents-md-instructions` runs `seriesOrder` 1–18 and contains both the Copilot
Skills posts and the legacy-modernization posts. The legacy articles even say
"This is Part 2 of the legacy-modernization thread" in their body while the site
renders them as part 15 of a different series. Split into:

- `copilot-skills-agents-md` — orders 1–13
- `legacy-modernization` — orders 1–5 (matching what the articles already claim)

**b. There is no per-series page.** `/series` is a single flat list. A series
hub at `/series/<id>` with real intro copy is the classic pillar page: it
concentrates internal links, gives answer engines one URL that describes the
whole topic, and is what ranks for the head term. This is the highest-value
page type the site does not have.

## 4. Content gaps, by pillar

After the drafts ship, these are the holes. Each is a real query, and each
belongs to a cluster that will already have supporting posts to link from.

**Design Patterns** — zero coverage, and the easiest pillar to build because the
reference project supplies examples.
- "Design patterns in C# that actually show up in production code"
- "Repository pattern vs. DbContext — when the abstraction earns its keep"
- "Strategy and factory in a real .NET pricing engine"
- "The Netflix architecture short, written out as an article" (a short already exists)

**Technical Architecture** — currently only a secondary tag.
- "Clean Architecture in .NET without the ceremony"
- "Choosing between vertical slice and layered architecture"
- "How I write an ADR that someone reads two years later"

**Programming Learning** — three thin posts and nothing else.
- ".NET learning roadmap for 2026" (a genuine annual traffic magnet)
- "C# features I actually use, and the ones I skip"
- Expand or merge the three sub-700-word posts; thin pages drag the whole domain

**Azure Cloud** (as distinct from Azure AI)
- "Managed identity everywhere — killing connection strings in Azure"
- "Azure cost traps in an AI workload"
- Seven Azure shorts already exist; each is an article prompt with a video to embed

**Flutter** — after the drafts, it still lacks non-AI Flutter content.
- "Flutter state management in 2026 — BLoC, Riverpod, and when neither"
- "Flutter + Firebase offline-first, the parts the docs skip"

## 5. What has shipped

Everything in sections 1-4 that is mechanical is done. Recorded here so the
remaining work is unambiguous.

**The gates now mean something.**
- `check-seo.mjs` no longer scans `src/content/Real/**.md`. Those are shorts
  caption sheets with no frontmatter by design, and they were producing all 20
  of the gate's blocking failures — a permanently red gate everyone learns to
  ignore.
- `check-seo.mjs` now measures `seoTitle ?? title`, which is what the page
  actually renders. It was measuring `title` alone, so every post already fixed
  with a short `seoTitle` still reported as broken.
- **The brand suffix was the real title problem.** Every page rendered
  `<title> | MSDEVBUILD by Suthahar`, and that suffix costs 270px of the 600px
  budget — 45% spent before the page says anything, leaving ~30 characters for
  the title. Nearly every post truncated. The suffix is now `| MSDEVBUILD`
  (149px). Attribution moved to where it costs nothing: the Person node in the
  JSON-LD graph, `twitter:creator`, `og:site_name`, and the visible byline.
- 17 posts and 2 events got a short `seoTitle`; `seoTitle` was added to the
  events schema, which did not have it. Seven descriptions were trimmed under
  the 960px target. **`npm run check:seo` is now clean across all 54 pages.**

**AEO.** All 38 over-length FAQ answers across 8 posts were trimmed under 340
characters, and the 8-entry FAQ block on the legacy cornerstone was cut to 6.
Those strings are exactly what AI answer engines lift, so this was the single
highest-value edit on the list.

**Structure.**
- The 18-part `agents-md-instructions` mega-series is split. It keeps parts
  1-13 (the Copilot Skills and AGENTS.md cluster). The five legacy articles
  moved to a new `legacy-modernization` series, renumbered 1-5 — which is what
  their own bodies always claimed ("This is Part 2 of the legacy-modernization
  thread" while the site rendered it as part 15 of something else).
- **Series hub pages exist** at `/series/<id>`, rendering the series' own prose,
  the ordered part list, and `CreativeWorkSeries` + `ItemList` schema. Series
  used to be anchors into one long page, so no topic had a URL of its own.
  `seriesUrl()` now points at the hub; `/series/#id` anchors still resolve.

**Scheduled publishing.** All 26 drafts are now `draft: false` with future
dates, three a week (Mon/Wed/Fri) from 2026-08-10 to 2026-10-07: the three
remaining legacy parts first, then the Copilot token post, then all 12 Azure AI
Foundry parts, then the 10 AI-agent-team parts.

This needed a mechanism the site did not have. `getPublishedPosts()` filtered
on `draft` only, so a future date would have gone live immediately. It now also
requires the date to have arrived, `getScheduledPosts()` exposes the queue,
`/preview` shows scheduled posts alongside drafts, and `deploy.yml` gained a
daily 05:30 UTC cron so a post goes live on its date with nobody touching the
repo. Dev still shows everything.

**Entity schema.** `TECH_ENTITIES` in `src/lib/taxonomy.ts` maps technologies to
their canonical URLs (all verified resolving), and each post now emits
schema.org `about` (primary subject) and `mentions` (the rest) with `sameAs`,
plus `isPartOf` its `CreativeWorkSeries` and its `position` in it. This is what
tells an answer engine that "Azure AI Foundry" here means Microsoft's platform.
Only entities with a stable official page are in the map — a concept with no
canonical URL is a tag, not an entity.

## 6. What is left

**Needs you, not automation:**

- **Cover images — 33 posts have none**, including most of the newly scheduled
  ones. Every share falls back to the generic OG card. This is the largest
  remaining item and it needs authored images.
- **Outbound citations — 10 posts have none.** Deliberately not automated:
  guessing a Microsoft Learn deep link is worse than having no link. The Azure
  and Foundry posts are the ones where this matters most, and they publish from
  2026-08-19, so there is time.
- **Three thin posts** (408, 636, 649 words) still have no internal links and
  no cover. Expand or merge them; thin pages drag the domain.
- **Six posts have fewer than two question-shaped H2s**, and three do not use
  their own key terms in the first 100 words.
- **`HowTo` schema** on the build-along tutorials was left off on purpose.
  It needs correct step extraction per article, and wrong HowTo markup is worse
  than none.

**The content gaps in section 4 are unchanged.** Design Patterns and Technical
Architecture still have zero published articles and no drafts behind them.
After the scheduled queue drains, that is where the next writing goes.

## 7. Original fix list (for reference)
## 5. Fix list from the site's own gates

Ranked by cost-to-value. Run `npm run check:seo` and `npm run check:aeo`.

**1. The SEO gate is red for false reasons.** All 20 blocking failures come from
10 shorts caption files under `src/content/Real/**.md`, which `docs/SHORTS.md`
explicitly documents as *not published*. `check-seo.mjs` walks all of
`src/content` and demands frontmatter they were never meant to have. Fix the
scan scope in `scripts/check-seo.mjs` — a gate that is always red gets ignored,
and it is currently masking the real title-length warnings underneath it.

**2. FAQ answers over 340 characters — the direct AEO loss.** Six published
posts have answers too long to be quoted whole; `github-copilot-agents-for-legacy-applications.mdx`
has all eight over the limit, plus two FAQs more than the six-entry cap. These
are the exact strings AI answer engines lift. Trimming them is the highest-value
hour on this list.

**3. Titles over the 600px budget.** `azure-openai-rag-dotnet.md` (957px),
`secure-minimal-api-jwt-dotnet.md` (904px), `minimal-api-project-structure.md`
(850px), and `github-copilot-understand-legacy-codebase-discovery.mdx` (1001px)
need a short `seoTitle`. The on-page H1 stays as written.

**4. Missing cover images** on six published posts, including three of the
strongest Copilot articles. Every share falls back to the generic OG card.

**5. No outbound citations** on several posts. Citing Microsoft Learn and the
GitHub docs is a trust signal, and it matters most on exactly the Azure and
Foundry posts about to be published.

**6. `github-copilot-pr-summary-reviewers-actually-read.mdx`** does not mention
its own key terms in the first 100 words.

## 8. Entity and schema work

`src/pages/blog/[...slug].astro` already emits BlogPosting, BreadcrumbList and
FAQPage, all bound to a single `#person` node. That is a good base. Three
additions, in order of value:

1. **`about` / `mentions` with `sameAs`.** Link each post's core technology to
   its canonical URL (Microsoft Learn for Azure AI Foundry, flutter.dev for
   Flutter, the GitHub docs for Copilot). This is how an answer engine confirms
   "Azure AI Foundry" here means Microsoft's platform and not something else —
   the single most useful schema upgrade for the Azure pillars.
2. **`CreativeWorkSeries` + `isPartOf`** once the series split lands, so the
   parts of a series are machine-readably one work.
3. **`HowTo`** on the build-along tutorials (`build-first-github-copilot-skill…`,
   the Foundry setup posts). They are already step-structured.

Also worth noting: "Azure AI Foundry" was renamed from Azure AI Studio and is
now also called Microsoft Foundry. Posts should name both, once, early — that
covers the query both ways and helps entity resolution.

## 9. Suggested order

1. Fix the `check-seo.mjs` scan scope so the gate means something again.
2. Trim the over-length FAQ answers; add the missing `seoTitle` values.
3. Split the mega-series and add `/series/<id>` hub pages.
4. Start publishing `azure-ai-foundry-agents`, two to three parts a week.
5. Then `ai-agent-team`, same cadence.
6. Add `about`/`sameAs` schema while the Azure posts are going out.
7. Write into the Design Patterns and Architecture gaps — the two pillars with
   no drafts behind them.
