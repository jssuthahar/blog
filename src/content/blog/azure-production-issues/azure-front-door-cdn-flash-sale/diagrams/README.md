# Diagram sources

Every article in this series keeps its own folder:

```
<series>/<article-slug>/
  <article-slug>.mdx      the post; the filename is the URL, folders are ignored
  images/                 exported PNGs the post references as ./images/<name>.png
  diagrams/               .drawio sources + generate.py + this file
```

`README.md` is excluded from the blog content collection in `src/content.config.ts`,
which is what lets a documentation file live beside a post without the loader
trying to validate it as one.

The `.drawio` files here are the editable sources for the figures in this
series. The exported PNGs live in `../images/` and are what the articles
reference; Astro optimises them to WebP at several widths at build time.

## Editing one by hand

Open the `.drawio` file in draw.io (desktop or diagrams.net), change it, then
re-export from the repo root:

```bash
/Applications/draw.io.app/Contents/MacOS/draw.io \
  --export --format png --scale 2 \
  --output src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/images/<name>.png \
  src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams/<name>.drawio
```

Flag order matters. `--export --format ... --output ... <input>` works;
`-x -f png -o ... <input>` reports "input file/directory not found", and
`--background` breaks the argument parsing, which is why the white backing is a
rectangle baked into each diagram instead.

## Regenerating all of them

`generate.py` rebuilds every `.drawio` from scratch, embedding the icons from
`public/icons/` as base64 so the diagrams carry no external references. Run it
from the repo root:

```bash
python3 src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams/generate.py \
        src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams
```

Two things that will bite you if you edit the generator:

- **No raw `<` in a label.** `value="a<br>b"` is malformed XML and draw.io
  silently drops that cell *and every cell after it*. Use `&lt;br&gt;`.
- **Angle brackets in text get eaten.** With `html=1`, a label containing
  `&lt;token&gt;` renders as an unknown HTML tag and disappears. Write it
  without brackets.

## Image SEO

- **Filenames carry keywords**, not figure numbers:
  `azure-front-door-cdn-redis-flash-sale-architecture.png`, never `fig3.png`.
  Rename the export, not just the caption.
- **Alt text describes the diagram's content**, in a sentence someone who cannot
  see it could act on: the nodes, the order, and the outcome. Not "architecture
  diagram".
- **Every figure gets a `<figcaption>`**, wrapped like this so the markdown image
  is still optimised by Astro while picking up the site's caption styling:

  ```mdx
  <figure>

  ![long descriptive alt](./images/<name>.png)

  <figcaption>Figure N — what it shows.</figcaption>

  </figure>
  ```

  Blank lines inside the `<figure>` are load-bearing: without them MDX stops
  treating the image as markdown, and a raw `<img src="./images/...">` is served
  unoptimised.
- **Export PNG, not SVG.** Astro converts relative PNGs to WebP at several
  widths with `width`/`height` set, which removes layout shift. A draw.io SVG
  embeds every icon as base64 and ships two to three times larger, unoptimised.

## Diagram types and when to use each

| Type | Use it for | Standard followed |
| --- | --- | --- |
| Architecture | What the pieces are and who reaches what | Solid frame for callers, dashed for tiers, labelled arrows |
| Sequence | Who talks to whom, in what order | UML: lifelines, solid calls, dashed returns, self-call loops |
| Flowchart | The decision a request passes through | Rounded terminators, rectangles for work, rhombus decisions, every branch labelled |

## Drawing conventions

Kept consistent so the figures read as one system across the series:

- Callers sit in a **solid** rounded frame; tiers in **dashed** ones, with the
  tier name inside at the top left, which frees the right side for notes and
  for side branches such as Blob Storage in figure 3.
- Arrows are **labelled** with what travels over them. An unlabelled arrow only
  says "then".
- Arrows leave and enter the **frames**, not the icons, so they never cut
  through a node's own label.
- Azure services use the official Azure icons; everything else uses Material
  Symbols. See `public/icons/NOTICE.md` for both licences.
- Red (`#F8CECC` / `#B85450`) is the state you do not want; green
  (`#D5E8D4` / `#82B366`) is the one you do.
- Colour never carries the meaning alone. Every red outcome also has a `✗`
  and a word, every green one a `✓`, so the figure survives greyscale and a
  screen reader.
- Cell ids must not be JavaScript array method names. `"join"` and `"push"`
  both make the headless export fail with only `Export failed`; figure 1 here
  uses `notif` for the push notification for that reason.
