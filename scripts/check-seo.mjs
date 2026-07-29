#!/usr/bin/env node
// check-seo.mjs
// Gates the SEO fields search engines actually truncate: <title> and
// meta description. Both are measured in PIXELS, not characters, because
// that is what Google (and the SEO auditors that flag this blog) measure.
//
// Usage:
//   node scripts/check-seo.mjs                     # scan all src/content .md/.mdx frontmatter
//   node scripts/check-seo.mjs path/to/file.md ... # scan specific content files
//   node scripts/check-seo.mjs --dist              # scan built dist/**/*.html (covers .astro pages too)
//   node scripts/check-seo.mjs --strict            # also fail on titles, duplicates, thin descriptions
//   node scripts/check-seo.mjs --json              # machine-readable output
//
// Exit code: 0 = clean (or warnings only), 1 = blocking issues found.
//
// Descriptions block, titles warn. That split is deliberate: an over-long
// description is a pure loss (the tail is cut and nothing replaces it),
// while a long title still ranks on its leading keywords and shortening one
// is an editorial call about the author's own headline. Run --strict to gate
// on both.
//
// Why pixels: "155 characters" is a myth that fails on wide strings.
// "MMMM..." and "iiii..." are the same character count and nowhere near
// the same rendered width. Google renders descriptions in ~Arial 14px and
// titles in ~Arial Bold 20px, so we measure with real font metrics.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content');
const DIST_DIR = join(ROOT, 'dist');
const CONTENT_EXTS = new Set(['.md', '.mdx']);

const args = process.argv.slice(2);
const DIST_MODE = args.includes('--dist');
const JSON_MODE = args.includes('--json');
const STRICT = args.includes('--strict');
const fileArgs = args.filter((a) => !a.startsWith('--'));

// ---------------------------------------------------------------------------
// Limits. DESC_MAX/TITLE_MAX are where the search engine truncates; the
// TARGET values leave headroom so a one-word edit later doesn't regress us.
// ---------------------------------------------------------------------------
const DESC_MAX = 1000; // px — hard truncation point
const DESC_TARGET = 960; // px — stay here, ~4% headroom
const DESC_MIN = 500; // px — below this auditors flag "description too short"
const TITLE_MAX = 600; // px — hard truncation point
const TITLE_TARGET = 570; // px
const TITLE_MIN = 200; // px

const DESC_FONT_PX = 14; // Arial regular
const TITLE_FONT_PX = 20; // Arial bold

// ---------------------------------------------------------------------------
// Arial advance widths, units per 1000em. Calibrated against the live auditor
// report: the old 193-char home description measured 1199px, which this table
// reproduces at 13.88px — i.e. Arial 14px, within 0.8%.
// ---------------------------------------------------------------------------
const LOWER_REGULAR = [556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500];
const UPPER_REGULAR = [667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611];
const LOWER_BOLD = [556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500];
const UPPER_BOLD = [722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611];

function buildWidths(lower, upper, punct) {
  const w = { ...punct };
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c, i) => (w[c] = lower[i]));
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => (w[c] = upper[i]));
  '0123456789'.split('').forEach((c) => (w[c] = 556));
  return w;
}

const PUNCT_REGULAR = {
  ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  '[': 278, '\\': 278, ']': 278, '^': 469, _: 556, '`': 333, '{': 334, '|': 260, '}': 334, '~': 584,
  '—': 1000, '–': 556, '‘': 222, '’': 222, '“': 333, '”': 333, '…': 1000,
};
const PUNCT_BOLD = {
  ...PUNCT_REGULAR,
  '!': 333, '"': 474, "'": 238, '(': 333, ')': 333, ',': 278, '-': 333, '.': 278,
  ':': 333, ';': 333, '?': 611, '&': 722, '|': 280,
  '—': 1000, '–': 556, '’': 278,
};

const WIDTHS_REGULAR = buildWidths(LOWER_REGULAR, UPPER_REGULAR, PUNCT_REGULAR);
const WIDTHS_BOLD = buildWidths(LOWER_BOLD, UPPER_BOLD, PUNCT_BOLD);

/** Rendered width in px. Unknown glyphs fall back to 556 (a mid-width char). */
function pxWidth(text, { bold = false, fontPx = DESC_FONT_PX } = {}) {
  const table = bold ? WIDTHS_BOLD : WIDTHS_REGULAR;
  let units = 0;
  for (const ch of text) units += table[ch] ?? 556;
  return Math.round((units / 1000) * fontPx);
}

export function descriptionPx(text) {
  return pxWidth(text, { bold: false, fontPx: DESC_FONT_PX });
}
export function titlePx(text) {
  return pxWidth(text, { bold: true, fontPx: TITLE_FONT_PX });
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Pull a scalar string off the top-level YAML frontmatter block. */
function frontmatterValue(raw, key) {
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!line) return null;
  let v = line[1].trim();
  // Folded/literal block scalars (description: >) are multi-line; join them.
  if (v === '>' || v === '|' || v === '>-' || v === '|-') {
    const after = fm[1].slice(fm[1].indexOf(line[0]) + line[0].length);
    const block = [];
    for (const l of after.split('\n').slice(1)) {
      if (!/^\s+\S/.test(l)) break;
      block.push(l.trim());
    }
    v = block.join(' ');
  }
  // Strip matching surrounding quotes.
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.slice(1, -1);
  }
  return v.replace(/''/g, "'").trim();
}

// BaseHead.astro renders "<title> | MSDEVBUILD by Suthahar", so a frontmatter
// title is never what search engines actually measure. Charge the suffix to
// every content title or the numbers here would disagree with --dist.
const BRAND_SUFFIX = ' | MSDEVBUILD by Suthahar';

function readContentFile(path) {
  const raw = readFileSync(path, 'utf8');
  const draft = /^draft:\s*true\s*$/m.test(raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '');
  const title = frontmatterValue(raw, 'title');
  return {
    path,
    draft,
    title,
    renderedTitle: title ? title + BRAND_SUFFIX : null,
    description: frontmatterValue(raw, 'description'),
  };
}

function readDistFile(path) {
  const html = readFileSync(path, 'utf8');
  // Pages excluded from search results carry no SEO risk.
  if (/<meta[^>]+name="robots"[^>]*content="[^"]*noindex/i.test(html)) return null;
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return {
    path,
    title: title ? decodeEntities(title[1].trim()) : null,
    description: desc ? decodeEntities(desc[1]) : null,
  };
}

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, exts));
    else if (entry.isFile() && exts.has(extname(entry.name))) out.push(full);
  }
  return out;
}

function collect() {
  if (DIST_MODE) {
    if (!existsSync(DIST_DIR)) {
      console.error('seo: no dist/ directory. Run "npm run build" first.');
      process.exit(1);
    }
    return walk(DIST_DIR, new Set(['.html'])).map(readDistFile).filter(Boolean);
  }
  const files = fileArgs.length
    ? fileArgs
        .map((f) => (f.startsWith('/') ? f : join(ROOT, f)))
        .filter((f) => CONTENT_EXTS.has(extname(f)))
    : walk(CONTENT_DIR, CONTENT_EXTS);
  return files
    .filter((f) => {
      // README.md files document a content folder; they never become pages.
      if (/README\.mdx?$/i.test(f)) return false;
      try {
        return statSync(f).isFile();
      } catch {
        return false;
      }
    })
    .map(readContentFile);
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

function checkOne(entry) {
  const blocking = [];
  const warnings = [];
  const { title, description } = entry;
  // In --dist the <title> already carries the brand suffix; in content mode
  // we add it ourselves so both modes measure the same rendered string.
  const measuredTitle = entry.renderedTitle ?? title;

  if (!description) {
    blocking.push('missing meta description — every indexed page needs one');
  } else {
    const px = descriptionPx(description);
    if (px > DESC_MAX) {
      blocking.push(
        `description is ${px}px, ${px - DESC_MAX}px over the ${DESC_MAX}px limit — Google will truncate it (${description.length} chars)`,
      );
    } else if (px > DESC_TARGET) {
      warnings.push(`description is ${px}px, under the ${DESC_MAX}px limit but with almost no headroom (aim <= ${DESC_TARGET}px)`);
    } else if (px < DESC_MIN) {
      warnings.push(`description is only ${px}px — too thin to earn the click (aim ${DESC_MIN}-${DESC_TARGET}px)`);
    }
    if (title && description.trim().toLowerCase() === title.trim().toLowerCase()) {
      warnings.push('description just repeats the title — it should add information, not echo');
    }
  }

  if (!measuredTitle) {
    blocking.push('missing title');
  } else {
    const px = titlePx(measuredTitle);
    const suffixNote = entry.renderedTitle ? ` incl. the "${BRAND_SUFFIX.trim()}" suffix` : '';
    if (px > TITLE_MAX) {
      warnings.push(
        `title is ${px}px${suffixNote}, ${px - TITLE_MAX}px over the ${TITLE_MAX}px limit — Google will truncate the tail (${measuredTitle.length} chars)`,
      );
    } else if (px > TITLE_TARGET) {
      warnings.push(`title is ${px}px${suffixNote}, close to the ${TITLE_MAX}px limit (aim <= ${TITLE_TARGET}px)`);
    } else if (px < TITLE_MIN) {
      warnings.push(`title is only ${px}px — likely too vague to rank`);
    }
  }

  // Under --strict every warning is a gate.
  if (STRICT && warnings.length) {
    blocking.push(...warnings.splice(0, warnings.length));
  }

  return { ...entry, blocking, warnings };
}

/** Duplicate titles/descriptions compete with each other in search results. */
function findDuplicates(results) {
  const dupes = [];
  for (const field of ['title', 'description']) {
    const seen = new Map();
    for (const r of results) {
      const v = r[field];
      if (!v) continue;
      const key = v.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(r.path);
    }
    for (const [, paths] of seen) {
      // The site-wide SITE.description legitimately repeats across home/RSS/etc.
      if (paths.length > 1 && !DIST_MODE) {
        dupes.push({ field, paths });
      }
    }
  }
  return dupes;
}

function main() {
  const entries = collect();
  if (!entries.length) {
    console.log('seo: nothing to scan.');
    return 0;
  }

  const results = entries.map(checkOne);
  const dupes = findDuplicates(results);

  if (JSON_MODE) {
    console.log(JSON.stringify({ results, dupes }, null, 2));
    return results.some((r) => r.blocking.length) ? 1 : 0;
  }

  let blockingFiles = 0;
  let warningFiles = 0;

  for (const r of results) {
    if (!r.blocking.length && !r.warnings.length) continue;
    console.log(`\n${relative(ROOT, r.path)}${r.draft ? ' (draft)' : ''}`);
    for (const m of r.blocking) console.log(`  ✗ ${m}`);
    for (const m of r.warnings) console.log(`  • ${m}`);
    if (r.blocking.length) blockingFiles++;
    else warningFiles++;
  }

  for (const d of dupes) {
    console.log(`\n  • duplicate ${d.field} across: ${d.paths.map((p) => relative(ROOT, p)).join(', ')}`);
  }

  console.log('');
  if (blockingFiles) {
    console.log(`seo: ${blockingFiles} file(s) with blocking issues. Shorten the flagged title/description, then retry.`);
    console.log('(Widths are pixels at Arial 14px / bold 20px — the same measure Google and SEO auditors use.)');
    return 1;
  }
  if (warningFiles || dupes.length) {
    console.log(`seo: ${warningFiles} file(s) worth reviewing, nothing blocking.`);
  } else {
    console.log(`seo: all ${results.length} page(s) within title and description limits. ✓`);
  }
  return 0;
}

// Only run when invoked directly, so the width helpers stay importable.
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
