#!/usr/bin/env node
// check-humanizer.mjs
// Scans src/content .md and .mdx prose for common "AI-generated" tells so
// content reads human-written before it's generated, committed, or pushed.
//
// Usage:
//   node scripts/check-humanizer.mjs                 # scan all src/content .md/.mdx
//   node scripts/check-humanizer.mjs path/to/file.md [...]  # scan specific files
//   node scripts/check-humanizer.mjs --strict        # also fail on soft tells / em-dash density
//
// Exit code: 0 = clean (or warnings only), 1 = blocking issues found.
// Only prose is scanned — frontmatter and fenced code blocks are stripped first.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content');
const CONTENT_EXTS = new Set(['.md', '.mdx']);
const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const fileArgs = args.filter((a) => !a.startsWith('--'));

// Hard tells: strong signals of unedited AI prose. These block by default.
const HARD_TELLS = [
  'delve', 'delving', 'tapestry', 'testament to', 'ever-evolving', 'ever-changing',
  'in the ever-evolving', 'navigating the', 'in the realm of', 'realm of', 'the world of',
  "in today's fast-paced", "in today's digital", 'in this digital age', 'unleash',
  'unleashing', 'supercharge', 'game-changer', 'game changer', 'plethora', 'myriad of',
  'harness the power', 'unlock the power', 'unlock the potential', 'a testament',
  'look no further', 'the power of', 'revolutionize', 'revolutionizing', 'paradigm shift',
  "it's important to note that", 'it is important to note that', 'rest assured',
  'embark on', 'embark on a journey', 'need to worry', 'worry no more',
];

// Soft tells: overused AI filler. Reported as warnings; block only under --strict.
const SOFT_TELLS = [
  'leverage', 'leveraging', 'utilize', 'utilizing', 'seamless', 'seamlessly', 'robust',
  'crucial', 'essential', 'dive into', 'let us dive', "let's dive", 'deep dive',
  "it's worth noting", 'it is worth noting', 'in conclusion', 'furthermore', 'moreover',
  'additionally', 'notably', 'importantly', 'best practices', 'cutting-edge', 'state-of-the-art',
  'streamline', 'streamlined', 'holistic', 'pivotal',
  'foster', 'facilitate', 'ensure that', 'a wide range of', 'when it comes to',
  'at the end of the day', 'first and foremost', 'to sum up',
  // Verb-phrase form only — bare "underscore(s)" is a literal character on coding blogs
  'underscores the', 'underscore the importance', 'underscores that',
];

// Density thresholds (per 1000 words). Warn always; block under --strict.
const EMDASH_PER_1K = 8; // em-dash "—" density
const SOFT_PER_1K = 12; // combined soft-tell density

function stripForProse(raw) {
  let text = raw;
  // Strip YAML frontmatter (leading --- ... ---)
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
  // Strip fenced code blocks ``` ... ```
  text = text.replace(/```[\s\S]*?```/g, '');
  // Strip inline SVG / diagram blocks — labels aren't prose
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  // Strip inline code `...`
  text = text.replace(/`[^`]*`/g, '');
  // Strip markdown link/image URLs, keep the visible text
  text = text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
  return text;
}

function countMatches(text, phrase) {
  // Word-boundary-ish match, case-insensitive. Escape regex specials.
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = /^[a-z]/i.test(phrase) ? '\\b' : '';
  const re = new RegExp(`${boundary}${esc}`, 'gi');
  const m = text.match(re);
  return m ? m.length : 0;
}

// Count em-dashes only in flowing paragraph prose. Markdown list items,
// headings, blockquotes, and table rows legitimately use "term — gloss"
// dashes for structure, so they don't signal AI-flavored writing.
function countProseEmdashes(text) {
  let n = 0;
  for (const line of text.split('\n')) {
    if (/^\s*([-*+]|\d+[.)])\s/.test(line)) continue; // list item
    if (/^\s*#{1,6}\s/.test(line)) continue; // heading
    if (/^\s*>/.test(line)) continue; // blockquote
    if (/^\s*\|/.test(line)) continue; // table row
    n += (line.match(/—/g) || []).length;
  }
  return n;
}

function scanFile(path) {
  const raw = readFileSync(path, 'utf8');
  const prose = stripForProse(raw);
  const words = (prose.match(/\b[\w'-]+\b/g) || []).length || 1;

  const hard = [];
  for (const phrase of HARD_TELLS) {
    const n = countMatches(prose, phrase);
    if (n) hard.push([phrase, n]);
  }

  const soft = [];
  let softTotal = 0;
  for (const phrase of SOFT_TELLS) {
    const n = countMatches(prose, phrase);
    if (n) {
      soft.push([phrase, n]);
      softTotal += n;
    }
  }

  const emdash = countProseEmdashes(prose);
  const emdashPer1k = (emdash / words) * 1000;
  const softPer1k = (softTotal / words) * 1000;

  return { path, words, hard, soft, emdash, emdashPer1k, softPer1k };
}

function walkContent(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkContent(full));
    } else if (entry.isFile() && CONTENT_EXTS.has(extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function collectFiles() {
  if (fileArgs.length) {
    return fileArgs
      .map((f) => (f.startsWith('/') ? f : join(ROOT, f)))
      .filter((f) => CONTENT_EXTS.has(extname(f)));
  }
  return walkContent(CONTENT_DIR);
}

function fmt(n) {
  return n.toFixed(1);
}

function main() {
  const files = collectFiles();
  if (!files.length) {
    console.log('humanizer: no .mdx files to scan.');
    return 0;
  }

  let blocking = 0;
  let warnings = 0;

  for (const path of files) {
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    const r = scanFile(path);
    const rel = relative(ROOT, path);
    const issues = [];

    if (r.hard.length) {
      const list = r.hard.map(([p, n]) => `"${p}"${n > 1 ? ` ×${n}` : ''}`).join(', ');
      issues.push(`  ✗ AI tells (fix these): ${list}`);
    }
    if (r.soft.length) {
      const list = r.soft.map(([p, n]) => `"${p}"${n > 1 ? ` ×${n}` : ''}`).join(', ');
      issues.push(`  • overused filler (review): ${list}`);
    }
    if (r.emdashPer1k > EMDASH_PER_1K) {
      issues.push(`  • em-dash density: ${fmt(r.emdashPer1k)}/1k words (aim < ${EMDASH_PER_1K}) — reads as AI`);
    }
    if (r.softPer1k > SOFT_PER_1K) {
      issues.push(`  • filler density: ${fmt(r.softPer1k)}/1k words (aim < ${SOFT_PER_1K})`);
    }

    if (!issues.length) continue;

    console.log(`\n${rel}`);
    for (const line of issues) console.log(line);

    const hasBlocking =
      r.hard.length > 0 ||
      (STRICT && (r.soft.length > 0 || r.emdashPer1k > EMDASH_PER_1K || r.softPer1k > SOFT_PER_1K));
    if (hasBlocking) blocking++;
    else warnings++;
  }

  console.log('');
  if (blocking) {
    console.log(`humanizer: ${blocking} file(s) with blocking issues. Edit them so the content reads human, then retry.`);
    console.log('(Run "npm run check:humanizer" to re-scan. Add --strict to also gate on filler/em-dash density.)');
    return 1;
  }
  if (warnings) {
    console.log(`humanizer: ${warnings} file(s) have warnings worth reviewing, but nothing blocking.`);
  } else {
    console.log('humanizer: all scanned content reads clean. ✓');
  }
  return 0;
}

process.exit(main());
