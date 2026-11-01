#!/usr/bin/env node
// check-covers.mjs
// Cover-image inventory for blog posts.
//
// Every post already gets a thumbnail: when `cover:` is absent, cards fall back
// to the post's own share card, drawn from its title in src/lib/og-card.ts. That
// keeps the site from ever looking broken — but a drawn card is the site talking
// about the post, not the post showing its work. A screenshot of the thing you
// actually built is worth more to a reader deciding whether to click, and it is
// the kind of evidence an award reviewer can see at a glance.
//
// So this script does not block anything. It keeps a running list of published
// posts still riding the fallback, so the backlog is visible and shrinks on
// purpose rather than by accident.
//
// Usage:
//   node scripts/check-covers.mjs                  # published posts
//   node scripts/check-covers.mjs --all            # drafts too
//   node scripts/check-covers.mjs --strict         # exit 1 if any are missing
//   node scripts/check-covers.mjs --json
//
// Exit code: 0 always, unless --strict and a published post has no cover.
// Broken references (a cover: pointing at a file that isn't there) always exit 1
// — that one is a real error, and the build would fail on it anyway.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, basename, dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const EXTS = new Set(['.md', '.mdx']);

const args = process.argv.slice(2);
const JSON_MODE = args.includes('--json');
const INCLUDE_DRAFTS = args.includes('--all');
const STRICT = args.includes('--strict');

/** Below this the image is upscaled on a hero card and looks soft. */
const MIN_WIDTH = 1200;
/** Cards are 1200×630; anything far off that ratio gets cropped hard. */
const TARGET_RATIO = 1200 / 630;
const RATIO_TOLERANCE = 0.35;

// --- Frontmatter ------------------------------------------------------------
// Same deliberately-small parser the other check scripts use: scalars only.

function splitFile(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  return m ? { fm: m[1], body: raw.slice(m[0].length) } : { fm: '', body: raw };
}

function unquote(v) {
  let s = v.trim();
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  return s.replace(/''/g, "'").trim();
}

function scalar(fm, key) {
  const line = fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  if (!line) return null;
  const v = line[1].trim();
  return v ? unquote(v) : '';
}

// --- Image dimensions -------------------------------------------------------
// Header-only reads, so a 4MB screenshot costs a few bytes to measure. Returns
// null for anything unrecognised rather than guessing.

function dimensions(file) {
  let buf;
  try {
    buf = readFileSync(file);
  } catch {
    return null;
  }

  // PNG: IHDR is always the first chunk.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: walk the segment chain to the first start-of-frame.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0–SOF15, skipping the four that aren't frame headers.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }

  // WebP: three container flavours, each with its own size field.
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8X') {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (kind === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (kind === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  return null;
}

// --- Checks -----------------------------------------------------------------

function analyse(file) {
  const { fm } = splitFile(readFileSync(file, 'utf8'));
  const cover = scalar(fm, 'cover');
  const coverAlt = scalar(fm, 'coverAlt');
  const draft = scalar(fm, 'draft') === 'true';
  const title = scalar(fm, 'title') ?? basename(file);

  const problems = [];
  let resolved = null;

  if (cover) {
    resolved = resolve(dirname(file), cover);
    if (!existsSync(resolved)) {
      problems.push(`cover: points at a file that does not exist — ${cover}`);
    } else {
      if (!coverAlt) problems.push('coverAlt is missing (required whenever a cover is set)');

      const dim = dimensions(resolved);
      if (dim) {
        if (dim.width < MIN_WIDTH) {
          problems.push(
            `cover is ${dim.width}×${dim.height} — under ${MIN_WIDTH}px wide it is upscaled on a hero card`,
          );
        }
        const ratio = dim.width / dim.height;
        if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
          problems.push(
            `cover ratio is ${ratio.toFixed(2)}:1 — cards crop to ${TARGET_RATIO.toFixed(2)}:1, so the edges are cut`,
          );
        }
      }
    }
  }

  return { file, title, draft, cover, hasCover: Boolean(cover), problems };
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(extname(e.name)) && !/README/i.test(e.name)) out.push(p);
  }
  return out;
}

function main() {
  const files = walk(BLOG_DIR).filter((f) => {
    try {
      return statSync(f).isFile();
    } catch {
      return false;
    }
  });

  const results = files.map(analyse);
  const published = results.filter((r) => !r.draft);
  const drafts = results.filter((r) => r.draft);

  const missing = published.filter((r) => !r.hasCover);
  const broken = results.filter((r) => r.problems.length);
  const draftsMissing = drafts.filter((r) => !r.hasCover);

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        results.map(({ file, draft, hasCover, cover, problems }) => ({
          file: relative(ROOT, file),
          draft,
          hasCover,
          cover,
          problems,
        })),
        null,
        2,
      ),
    );
    return broken.length || (STRICT && missing.length) ? 1 : 0;
  }

  if (broken.length) {
    console.log('\nProblems with covers already set:');
    for (const r of broken) {
      console.log(`\n${relative(ROOT, r.file)}${r.draft ? ' (draft)' : ''}`);
      for (const m of r.problems) console.log(`  ✗ ${m}`);
    }
  }

  if (missing.length) {
    console.log(`\n${missing.length} published post(s) with no cover image — showing the drawn share card:`);
    for (const r of missing) {
      console.log(`  • ${basename(r.file).replace(/\.mdx?$/, '')}`);
      console.log(`    ${r.title}`);
    }
    console.log('\n  Add one with:');
    console.log("    cover: './images/<name>.png'      1200×630, next to the post");
    console.log("    coverAlt: 'What the image shows'  required, and read aloud");
  }

  if (INCLUDE_DRAFTS && draftsMissing.length) {
    console.log(`\n${draftsMissing.length} draft(s) with no cover yet:`);
    for (const r of draftsMissing) {
      console.log(`  • ${basename(r.file).replace(/\.mdx?$/, '')}`);
    }
  }

  const withCover = published.length - missing.length;
  console.log('');
  console.log(`covers: ${withCover}/${published.length} published post(s) have an authored cover image.`);
  if (!INCLUDE_DRAFTS && draftsMissing.length) {
    console.log(`(${draftsMissing.length} draft(s) without one — run with --all to list them.)`);
  }

  if (broken.length) {
    console.log('covers: fix the problems above — a broken cover: path fails the build.');
    return 1;
  }
  if (missing.length) {
    if (STRICT) {
      console.log('covers: --strict — every published post needs its own image.');
      return 1;
    }
    console.log('covers: nothing blocking. The fallback holds until you get to them.');
    return 0;
  }

  console.log('covers: every published post carries its own image. ✓');
  return 0;
}

process.exit(main());
