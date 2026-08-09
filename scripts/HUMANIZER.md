# Humanizer content guard

Keeps `src/content` prose reading human-written by flagging common "AI-generated"
tells before content is **generated, committed, or pushed**. Covers every `.md`
and `.mdx` file anywhere under `src/content` (blog, events, speaking, etc.).

## What it checks

Scanner: [`scripts/check-humanizer.mjs`](./check-humanizer.mjs). It strips
frontmatter and code blocks first (so code is never flagged), then looks for:

- **Hard tells** (block): `delve`, `tapestry`, `ever-evolving`, `unleash`,
  `realm of`, `game-changer`, `supercharge`, etc.
- **Soft filler** (warn): `leverage`, `utilize`, `seamless`, `robust`,
  `best practices`, `dive into`, …
- **Density** (warn): em-dashes and filler words per 1,000 words.

Edit the arrays at the top of the script to add or remove terms.

### Structural tells (warn)

Vocabulary is the easy half. AI detectors don't read word lists — they score how
*predictable* the writing is, so an article can be free of every banned word and
still read as machine-written. These checks track the rhythm signals detectors
actually measure:

| Check | Threshold | Why |
|---|---|---|
| Sentence rhythm (burstiness) | CV > `0.6` | Humans swing between long explanations and short punches. Uniform sentence length is the strongest rhythm tell. |
| Question headings | < 30% of headings | "What is X?" / "Why do I need Y?" stacked down a page is a generated-outline shape. |
| Recycled transitions | < 3 per 1k words | "Let me…", "Here is the…", "In short" are fine occasionally, a tell when every section opens the same way. |
| Table density | < 18 rows per 1k words | A ceiling guard against drift, **not** a push to delete tables — they earn their place and answer engines quote them. |
| Screenshot present | ≥ 1 image | Published blog posts only. A screenshot of your real screen is the one artifact no model can fabricate. |

Burstiness is skipped on posts under 15 sentences, where the statistic is noise.
The screenshot check skips drafts and everything outside `src/content/blog`.

Exit code: `0` = clean or warnings only · `1` = blocking hard tells found.
Structural tells never block on their own; `--strict` promotes them (along with
filler and density) to blocking.

## The three guards

| Guard | Runs when | Scope |
|---|---|---|
| `npm run check:humanizer` | manually, anytime | all of `src/content`, recursive |
| `.claude/settings.json` PostToolUse hook | Claude Code writes/edits a file | `*src/content/*.{md,mdx}` — blocks the edit, hands back the report |
| `.githooks/pre-push` | `git push` | changed `src/content/**/*.{md,mdx}` |

## How to test

### 1. Scanner directly (fastest)

```bash
npm run check:humanizer                                 # scan everything
node scripts/check-humanizer.mjs path/to/file.mdx       # one file
node scripts/check-humanizer.mjs --strict               # also fail on filler/em-dash density
node scripts/check-humanizer.mjs path/to/file.mdx; echo "exit: $?"
```

Force a block to see it catch something:

```bash
printf -- '---\ntitle: t\n---\n\nLet us delve into the ever-evolving tapestry.\n' > src/content/blog/_test.mdx
node scripts/check-humanizer.mjs src/content/blog/_test.mdx; echo "exit: $?"   # expect exit 1
rm src/content/blog/_test.mdx
```

### 2. The "while generating" hook (Claude Code)

Ask Claude to write AI-flavored content (e.g. a paragraph containing `delve`)
into any `src/content` `.md`/`.mdx` file. The PostToolUse hook blocks the edit
and returns the humanizer report.

If it doesn't fire in a fresh session, open the `/hooks` menu once (reloads
config) or restart Claude Code — the settings watcher only tracks `.claude/`
if the file existed at startup.

### 3. The pre-push git hook (no real push needed)

```bash
git checkout -b humanizer-test
printf -- '---\ntitle: t\n---\n\nUnleash the game-changer, delve in.\n' > src/content/blog/_test.mdx
git add src/content/blog/_test.mdx && git commit -m "test" --no-verify
git push --dry-run origin humanizer-test          # hook runs, should BLOCK
git checkout main && git branch -D humanizer-test && rm -f src/content/blog/_test.mdx
```

Verify it's wired up:

```bash
git config core.hooksPath        # -> .githooks
ls -l .githooks/pre-push         # executable
```

Emergency override for a push: `git push --no-verify`.
