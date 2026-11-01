# Diagram sources

The `.drawio` files here are the editable sources for the figures in
`mobile-secret-in-apk.md`, plus the share banner. The exported PNGs live in
`../images/` and are what the article references; Astro optimises them to WebP
at several widths at build time.

| File | Figure | Shape |
| --- | --- | --- |
| `hardcoded-api-key-inside-apk-zip-contents.drawio` | Figure 1 | Fanout — what extracting the published package hands you |
| `mobile-app-key-vault-managed-identity-architecture.drawio` | Figure 2 | Architecture — app, your API, Key Vault, the services behind it |
| `mobile-secret-in-apk-cover.drawio` | Share banner | 1200×630 — headline left, Figure 1 cut to three boxes on the right |

`README.md` is excluded from the blog content collection in
`src/content.config.ts`, which is what lets this file sit beside a post.

## Regenerating

`generate.py` rebuilds the two figures from the shared builders in
`scripts/drawio_kit.py`, embedding the icons from `public/icons/` as base64 so
the diagrams carry no external references:

```bash
python3 src/content/blog/azure-mobile-security/mobile-secret-in-apk/diagrams/generate.py \
        src/content/blog/azure-mobile-security/mobile-secret-in-apk/diagrams
```

`banner.py` writes the cover separately, taking the output directory as its one
argument:

```bash
python3 src/content/blog/azure-mobile-security/mobile-secret-in-apk/diagrams/banner.py \
        src/content/blog/azure-mobile-security/mobile-secret-in-apk/diagrams
```

Then export each one, from the repo root:

```bash
/Applications/draw.io.app/Contents/MacOS/draw.io \
  --export --format png --scale 2 \
  --output src/content/blog/azure-mobile-security/mobile-secret-in-apk/images/<name>.png \
  src/content/blog/azure-mobile-security/mobile-secret-in-apk/diagrams/<name>.drawio
```

Flag order matters: `--export --format ... --output ... <input>` works, `-x -f
png -o ...` reports "input file/directory not found", and `--background` breaks
the argument parsing — which is why the white backing is a rectangle baked into
each diagram instead. That also makes one asset readable on both site themes.

The banner carries a white `canvas` rectangle at exactly 1200×630 with
`wrap(..., pad=0)`, so the export lands on the card, not on the bounding box of
whatever sits furthest right. draw.io still adds a pixel each way: the export is
2402×1262, and `src/pages/blog/[...slug].astro` re-emits it at exactly 1200×630.

## Things that cost time on these two

- **Duplicate cell ids kill the export**, with only `Export failed` to go on and
  no hint which cell. Figure 2 hit this when a helper generated `kvn` and a note
  cell was also called `kvn`. The XML parses fine either way.
- **`text()` does not wrap.** It has no `whiteSpace=wrap`, so a long note runs
  off the white backing and off the exported edge. Break the line yourself with
  `\n`.
- **`esc()` escapes ampersands**, so an HTML entity such as `&#10007;` ships as
  literal text. Pass the real character (`✕`) instead.
- **Figure 1 is a fanout drawn as a bus**, not with `fanout()`. That builder's
  two-column grid routes the hub arrows diagonally through the boxes on the row
  above once there are more than two branches, which cut two labels in half in
  the first export. A spine down the left with a stub into each box has no
  crossings at any branch count.

## Icons

`public/icons/azure/ai-search.svg` was copied from the private
`tools/azure-icons/` library for Figure 2. Azure icons are used unmodified and
always labelled with the product name; everything else is Material Symbols. See
`public/icons/NOTICE.md` for both licences.
