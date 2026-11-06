# AI Token Calculator figures

The `.drawio` files here are the editable sources for the figures on
`/open-source/ai-token-calculator/`. The exported PNGs live in `../images/`;
the page imports them, so Astro optimises them to WebP at build time.

| Figure | Shown in | What it explains |
|---|---|---|
| `token-journey-flow` | Step 1 · Start here | What happens to your text, from typing to the usage record |
| `token-request-sequence` | Step 4 · Watch it generate | Who talks to whom in one request, and the loop agent mode repeats |

## Regenerating

From the repo root:

```bash
python3 src/lib/token-academy/diagrams/generate.py src/lib/token-academy/diagrams

for n in token-journey-flow token-request-sequence; do
  /Applications/draw.io.app/Contents/MacOS/draw.io \
    --export --format png --scale 2 \
    --output src/lib/token-academy/images/$n.png \
    src/lib/token-academy/diagrams/$n.drawio
done
```

Then look at each PNG before committing: overlapping labels and clipped text
do not show up anywhere else. The figures use the shared builders in
`scripts/drawio_kit.py`; its docstring lists the traps (raw `<` in a label,
CLI flag order).
