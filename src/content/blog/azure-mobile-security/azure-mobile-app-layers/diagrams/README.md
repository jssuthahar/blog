# Diagram sources

The `.drawio` files here are the editable sources for the two figures in
`azure-mobile-app-layers.md`, plus the share banner. The exported PNGs live in
`../images/` and are what the article references; Astro optimises them to WebP at several widths at
build time.

| File | Figure | Shape |
| --- | --- | --- |
| `mobile-app-direct-database-connection-attack-surface.drawio` | Figure 1 | The straight line the article opens on — app, database, one red edge |
| `azure-mobile-app-five-security-layers-front-door-entra-private-endpoint.drawio` | Figure 2 | Layered — the five layers, each frame carrying its question |
| `azure-mobile-app-security-layers-cover.drawio` | Share banner | 1200×630 — headline left, Figures 1 and 2 cut to one red row and one green row on the right |

`README.md` is excluded from the blog content collection in
`src/content.config.ts`, which is what lets this file sit beside a post.

## Regenerating

```bash
python3 src/content/blog/azure-mobile-security/azure-mobile-app-layers/diagrams/generate.py
```

`banner.py` writes the cover separately, taking the output directory as its one
argument:

```bash
python3 src/content/blog/azure-mobile-security/azure-mobile-app-layers/diagrams/banner.py \
        src/content/blog/azure-mobile-security/azure-mobile-app-layers/diagrams
```

Then export each one, from the repo root:

```bash
/Applications/draw.io.app/Contents/MacOS/draw.io \
  --export --format png --scale 2 \
  --output src/content/blog/azure-mobile-security/azure-mobile-app-layers/images/<name>.png \
  src/content/blog/azure-mobile-security/azure-mobile-app-layers/diagrams/<name>.drawio
```

Flag order matters: `--export --format ... --output ... <input>` works, `-x -f
png -o ...` reports "input file/directory not found", and `--background` breaks
the argument parsing — which is why the white backing is a rectangle baked into
each diagram by `wrap()`. That also makes one asset readable on both themes.

The banner carries a white `canvas` rectangle at exactly 1200×630 with
`wrap(..., pad=0)`, so the export lands on the card, not on the bounding box of
whatever sits furthest right. draw.io still adds a pixel each way: the export is
2402×1262, and `src/pages/blog/[...slug].astro` re-emits it at exactly 1200×630.

## What the banner leaves out

The five layers are drawn as five unlabelled bars. Naming all five on the card
turned the right half into a table, and a table is unreadable at the 400px width
a feed actually renders — so the stack is only suggested, the headline carries
the number, and the five real names ride along as one small muted line above it.
Both rows reuse the same phone and the same database in the same two columns, so
the only thing that changes between the red row and the green row is what stands
in the middle, which is the article's argument in one glance.

## Two figures rather than one

The brief was one picture holding both shapes: the straight line and the five
layers that replace it. Side by side they fought each other — the five-layer
stack is tall and the straight line is the whole point of the first two
paragraphs, so it gets its own figure and its own moment before the table
arrives. Figure 1 closes on a green box naming what replaces the line, which is
the handover into Figure 2.

## Changes this article made to `scripts/drawio_kit.py`

Both are additive; existing generators produce byte-identical output.

- **`layered()` items may carry an icon.** An item is `(label, note)` or
  `(label, note, icon_rel)`. The logo sits inside the box at the left, with the
  product name as the bold first line right beside it. It has to be inside the
  box: the layer frames are 104px tall and an icon with its own label under it
  is 88px, so a left gutter either overflowed the frame or pushed the figure
  wider than the article column. Because the arrows run frame to frame, outside
  the boxes, nothing can cut through an icon or its name.
- **`layered()` takes `vias`.** `vias[n]` labels the arrow from layer n to layer
  n + 1, so each one says what the next layer is handed rather than just "then".
- **`box()` takes `pad_left`**, which is what clears room for that icon.

## Icons

Microsoft Entra ID has no icon in the Azure library under `tools/azure-icons/`
— `identity/` carries Entra ID Protection, Entra Connect, Managed Identities and
the rest, but not the directory service itself, and an Azure icon may only stand
for the product it actually names. Layer 3 therefore uses Material Symbols
`verified_user`, saved as `public/icons/material/verified-user.svg`, labelled
"Microsoft Entra ID". Layer 4 uses Material `filter_alt`
(`material/filter-alt.svg`), since a `WHERE` clause is a filter and there is no
Azure product to point at — the layer is your own code.

Everything else is an official Azure icon, used unmodified and labelled with its
product name: `front-door`, `waf`, `app-service`, `private-link` and
`sql-database`, all already in `public/icons/azure/`. See
`public/icons/NOTICE.md` for both licences.
