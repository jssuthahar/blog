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

// Recycled transitions: fine once, a tell when every section opens the same way.
// Reported as a density, not a ban — this is Suthahar's natural voice in
// moderation. It only reads as machine-written when it's the only gear.
const TRANSITIONS = [
  'let me', 'here is the', 'here is each', 'here is a', 'here is how', "here's the",
  'the honest answer', 'in short', 'that is the whole', 'the point is', 'here is why',
  'the one to remember', 'let me slow down', 'let me get you', 'the short answer',
];

// Density thresholds (per 1000 words). Warn always; block under --strict.
const EMDASH_PER_1K = 8; // em-dash "—" density
const SOFT_PER_1K = 12; // combined soft-tell density
const TRANSITION_PER_1K = 3; // recycled section-opener density
// Ceiling guard, not a push to delete tables: they earn their place in a
// technical post and answer engines quote them. Set just above the current
// site max (17.4/1k) so it catches drift in new content, not today's articles.
const TABLE_ROWS_PER_1K = 18;

// Structural thresholds. AI detectors score predictability, not authorship, so
// these track the rhythm signals they actually measure.
const BURSTINESS_MIN = 0.6; // sentence-length variation; human tech prose is 0.6-0.8
const MIN_SENTENCES = 15; // below this the burstiness stat is noise, so skip it
const QUESTION_HEADING_RATIO = 0.3; // "What is X?" / "Why do I need Y?" headings

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

// Flowing paragraph lines only. Headings, list items, table rows and
// blockquotes have their own rhythm and would skew the sentence stats.
function paragraphLines(text) {
  return text.split('\n').filter((line) => {
    const t = line.trim();
    if (!t) return false;
    if (/^([-*+]|\d+[.)])\s/.test(t)) return false;
    if (/^#{1,6}\s/.test(t)) return false;
    if (/^>/.test(t)) return false;
    if (/^\|/.test(t)) return false;
    return true;
  });
}

// Burstiness = coefficient of variation of sentence length. Humans swing
// between long explanations and short punches; generated prose tends to
// settle into one length. Low variation is what detectors read as machine.
function burstiness(text) {
  const sentences = paragraphLines(text)
    .join(' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => (s.match(/\b[\w'-]+\b/g) || []).length)
    .filter((n) => n > 1);
  if (sentences.length < MIN_SENTENCES) return null;
  const mean = sentences.reduce((a, b) => a + b, 0) / sentences.length;
  if (!mean) return null;
  const variance = sentences.reduce((a, b) => a + (b - mean) ** 2, 0) / sentences.length;
  return { cv: Math.sqrt(variance) / mean, mean, count: sentences.length };
}

function headingStats(text) {
  const headings = text.match(/^#{2,6}\s+.+$/gm) || [];
  const questions = headings.filter((h) => h.trim().endsWith('?')).length;
  return { total: headings.length, questions };
}

// Counted on the raw file: markdown images, plus the JSX forms MDX allows.
function countImages(raw) {
  const md = (raw.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length;
  const jsx = (raw.match(/<(?:img|Image|Figure)\b/g) || []).length;
  return md + jsx;
}

function frontmatterFlag(raw, key) {
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return line ? line[1].trim() : null;
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

  let transitionTotal = 0;
  for (const phrase of TRANSITIONS) transitionTotal += countMatches(prose, phrase);
  const transitionPer1k = (transitionTotal / words) * 1000;

  const tableRows = (raw.match(/^\s*\|/gm) || []).length;
  const tableRowsPer1k = (tableRows / words) * 1000;

  const burst = burstiness(prose);
  const headings = headingStats(prose);
  const images = countImages(raw);

  // Screenshots are the strongest human-authorship signal a post can carry,
  // but only published blog articles are expected to show one.
  const isBlogPost =
    relative(ROOT, path).startsWith(join('src', 'content', 'blog')) &&
    frontmatterFlag(raw, 'draft') !== 'true';

  return {
    path, words, hard, soft, emdash, emdashPer1k, softPer1k,
    transitionTotal, transitionPer1k, tableRows, tableRowsPer1k,
    burst, headings, images, isBlogPost,
  };
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

    // --- structural tells: what AI detectors actually measure ---
    const structural = [];
    if (r.burst && r.burst.cv < BURSTINESS_MIN) {
      structural.push(
        `  • sentence rhythm too even: ${r.burst.cv.toFixed(2)} (aim > ${BURSTINESS_MIN}), ` +
          `avg ${fmt(r.burst.mean)} words over ${r.burst.count} sentences — vary long explanations with short punches`
      );
    }
    if (r.headings.total >= 4) {
      const ratio = r.headings.questions / r.headings.total;
      if (ratio > QUESTION_HEADING_RATIO) {
        structural.push(
          `  • question headings: ${r.headings.questions}/${r.headings.total} (${Math.round(ratio * 100)}%, aim < ${Math.round(QUESTION_HEADING_RATIO * 100)}%) — rewrite some as statements`
        );
      }
    }
    if (r.transitionPer1k > TRANSITION_PER_1K) {
      structural.push(
        `  • recycled transitions: ${r.transitionTotal} ("let me…", "here is the…") = ${fmt(r.transitionPer1k)}/1k (aim < ${TRANSITION_PER_1K})`
      );
    }
    if (r.tableRowsPer1k > TABLE_ROWS_PER_1K) {
      structural.push(
        `  • table-heavy: ${r.tableRows} rows = ${fmt(r.tableRowsPer1k)}/1k words (aim < ${TABLE_ROWS_PER_1K}) — keep the tables that answer a question, walk through one in prose`
      );
    }
    if (r.isBlogPost && r.images === 0) {
      structural.push(
        '  • no screenshot: a published article with zero images has nothing only you could have produced — add one of your real screen'
      );
    }
    issues.push(...structural);

    if (!issues.length) continue;

    console.log(`\n${rel}`);
    for (const line of issues) console.log(line);

    const hasBlocking =
      r.hard.length > 0 ||
      (STRICT &&
        (r.soft.length > 0 ||
          r.emdashPer1k > EMDASH_PER_1K ||
          r.softPer1k > SOFT_PER_1K ||
          structural.length > 0));
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
