# Publishing a short video

Everything you need to do with the three files a short comes as. Read this once;
after that it is a 30-second job.

## TL;DR

```
src/content/Real/<Technology>/<slug>.html        ← paste as-is
src/content/Real/<Technology>/<slug>.spec.json   ← paste as-is
src/content/Real/<Technology>/<slug>.md          ← paste as-is (not published)
```

Then:

```bash
npm run dev          # check it at http://localhost:4321/shorts/
npm run build        # must finish clean
npm run check:seo -- --dist    # must not flag your new short
```

That is the whole publishing step. No page to create, no list to add it to, no
config to touch.

## The three files

All three share one **filename stem**, and that stem becomes the URL.

| File | Goes where | What the site does with it |
| --- | --- | --- |
| `<slug>.html` | `src/content/Real/<Technology>/` | The player. Embedded on the page, download-blocked. |
| `<slug>.spec.json` | same folder | Every word on the page — title, steps, takeaway, tags. |
| `<slug>.md` | same folder | **Not published.** The caption you paste into LinkedIn/Instagram. |

`<slug>.md` is kept next to the other two on purpose so the caption lives with
the short it belongs to. Nothing on the site reads it — the same caption is
already inside the spec under `post.caption`.

## The two rules

**1. The folder name is the technology.** It decides which category chip the
short files under, and it is shown on the page. `Python`, `Azure`,
`DesignPattern`, `Flutter` — one folder per area, reused for every short in it.

**2. The filename stem is the URL, and it must be unique across every folder.**

```
src/content/Real/Python/python-mutable-vs-immutable.html
                        └────────────┬─────────────┘
                    https://blog.msdevbuild.com/shorts/python-mutable-vs-immutable/
```

Keep the stem keyword-first and hyphenated — it is a real ranking signal, and it
is also what the `.md` twin and the share card are named after. Changing it later
breaks the URL, so get it right the first time.

## Adding a new technology folder

Just create it. A folder whose name already matches a site category
(`Azure`, `Mobile`, `Web`, `AI`, `Copilot`, `DevOps`, `Architecture`,
`Engineering`, `Career`, `Programming`) resolves on its own.

Anything else needs one line in `FOLDER_CATEGORY` in
[src/lib/shorts.ts](../src/lib/shorts.ts) — that is how `Python` files under
Programming and `DesignPattern` under Architecture. Miss it and the short still
publishes, it just lands under **Engineering**, which is the deliberate
fallback: a wrong chip beats a failed build.

## The field worth always adding: `publishedAt`

```json
{
  "slug": "python-mutable-vs-immutable",
  "topic": "How mutable and immutable variables work in Python",
  "publishedAt": "2026-08-02",
  ...
}
```

Optional, but add it. A dated short enters the **contribution record** on
`/contributions` as recorded technical content, counts in the "Last 12 months"
panel, and files under *Video, webcast & podcast* in the activity breakdown —
the rows an MVP review reads. Without a date the short publishes normally and
appears everywhere else; it just cannot appear in a dated log.

Nothing guesses this date for you, on purpose. `/contributions` is the one page
where every row is a claim someone may check, and an invented date there is
worse than a missing row.

It also orders the site: dated shorts sort newest-first on `/shorts`, on the
home page and in the app rail, ahead of any undated ones.

## The one field you sometimes have to add

If `npm run check:seo -- --dist` says your short's **title is over the 600px
limit**, add `seoTitle` to the spec, straight after `topic`:

```json
{
  "slug": "python-mutable-vs-immutable",
  "topic": "How mutable and immutable variables work in Python",
  "seoTitle": "Python mutable vs immutable",
  "title": { "main": "In Python, a name is a <em>sticker</em>, not a box", ... }
}
```

`seoTitle` changes only the browser tab and the Google result. The headline on
the page stays exactly as written. Keep it under ~33 characters — the
`| MSDEVBUILD by Suthahar` suffix costs 270px of the 600px budget on its own.

Measure a candidate before committing to it:

```bash
node -e "import('./scripts/check-seo.mjs').then(({titlePx})=>console.log(titlePx('Your title | MSDEVBUILD by Suthahar')))"
```

Aim for **570 or less**.

## What happens without you doing anything

Once the three files are in the folder, the short automatically gets:

- its page at `/shorts/<slug>/`, with every step written out and clickable
- a card on `/shorts/`, counted into the right category filter chip
- a card in the "30-second learning" band on the home page
- a tile in the app feed at `/app/`
- a dated row on `/contributions/` (when `publishedAt` is set)
- a poster drawn from its own title card — the `<em>` in `title.main` is what
  gets picked out in accent on it, so put the emphasis where the idea is
- reactions (like / love / celebrate / insightful), counted in Firestore
- a share image at `/og/short-<slug>.png`
- a Markdown twin at `/shorts/<slug>.md` for AI crawlers
- a `HowTo` structured-data block built from its steps
- entries in the sitemap, the site search index, and `llms.txt`

## How it plays on the site

The embedded copy differs from your original file in three ways, all applied
automatically at build time:

- **It starts itself.** No tap-to-play card — opening a short is already the
  decision to watch one.
- **Sound is on from the first frame.** The toggle in the player now turns sound
  *off* rather than on. The ambient music bed stays off; only the effects play.
- **Downloads are off** (see below).

One thing no site can control: browsers refuse to start audio until the visitor
has interacted with the page. So the picture plays immediately, and the sound
comes in on the first tap or click anywhere — on the short, a step, or the page
around it. There is no setting that changes this; it is the browser's autoplay
policy, and it applies to YouTube too.

## Downloads are off

The player is embedded with `sandbox="allow-scripts"` and passed inline, so
there is no URL that serves the short as a file, the browser refuses the
download, and screen capture is denied. The record button and its `D` shortcut
are stripped from the embedded copy.

Two things follow from that:

- **Your original `.html` still records.** Open the file directly from disk when
  you want to capture a short for Instagram or YouTube — the button is only
  removed from the copy the site serves.
- **This is not DRM.** Anyone can still film their own screen. It removes every
  affordance; it cannot remove the possibility.

## If the build warns about a short

```
[shorts] Python/foo.html: player template has changed (no function goto() ...)
```

The generator changed something the step-jump depends on. The short still plays
and the page is still complete — only "click a step to jump there" goes quiet.
Send the new template and the bridge in
[src/lib/shorts.ts](../src/lib/shorts.ts) can be re-pointed.

## Checklist

- [ ] Three files, one stem, in `src/content/Real/<Technology>/`
- [ ] Stem is unique across every folder, keyword-first, hyphenated
- [ ] `publishedAt` set, so it counts on `/contributions`
- [ ] New technology folder? Mapped in `FOLDER_CATEGORY` (or accept Engineering)
- [ ] `npm run build` finishes with no `[shorts]` warning
- [ ] `npm run check:seo -- --dist` does not flag it — add `seoTitle` if it does
- [ ] Opened `/shorts/<slug>/` — it plays on its own; sound comes in on first tap
- [ ] Clicked a step and Replay to confirm the player follows
