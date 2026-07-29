#!/usr/bin/env node
// check-aeo.mjs
// Answer Engine Optimization + entity/authority gate for blog posts.
//
// check-seo.mjs governs the two fields search engines TRUNCATE (title,
// description) and measures them in pixels. This script governs everything
// that decides whether a post gets QUOTED — by Google's AI Overviews, by
// ChatGPT/Claude/Perplexity, and by featured snippets — and whether that
// quote carries the Suthahar / MSDEVBUILD entity with it.
//
// Usage:
//   node scripts/check-aeo.mjs                      # all published posts
//   node scripts/check-aeo.mjs path/to/post.mdx     # one post
//   node scripts/check-aeo.mjs --all                # drafts too
//   node scripts/check-aeo.mjs --json
//
// Exit code: 0 = clean (or warnings only), 1 = blocking issues found.
//
// DRAFTS ARE NEVER BLOCKED. You cannot write an article top-to-bottom while a
// hook rejects every save for a missing FAQ. The gate binds when you flip
// `draft: false` — that is the moment the post becomes a search result.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, basename } from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const EXTS = new Set(['.md', '.mdx']);

const args = process.argv.slice(2);
const JSON_MODE = args.includes('--json');
const INCLUDE_DRAFTS = args.includes('--all');
const fileArgs = args.filter((a) => !a.startsWith('--'));

// --- Thresholds -------------------------------------------------------------
const FAQ_MIN = 3;
const FAQ_MAX = 6;
const FAQ_ANSWER_MIN_CHARS = 40; // shorter than this is not an answer
const FAQ_ANSWER_MAX_CHARS = 340; // longer than this stops being quotable
const HIGHLIGHT_MIN_CHARS = 80;
const HIGHLIGHT_MAX_CHARS = 400; // matches the Zod cap
const INTERNAL_LINKS_MIN = 2;
const QUESTION_HEADINGS_MIN = 2;
const LEAD_WORDS = 100; // the primary keyword must land inside this many words
const TITLE_PX_BUDGET = 600; // beyond this, seoTitle is required

// Words too generic to treat as the keyword signal of a slug.
const STOPWORDS = new Set([
  'a', 'an', 'and', 'the', 'for', 'to', 'of', 'in', 'on', 'with', 'your', 'you',
  'how', 'what', 'why', 'when', 'is', 'are', 'it', 'that', 'this', 'from', 'by',
  'guide', 'tutorial', 'complete', 'first', 'using', 'use', 'build', 'building',
]);

// ---------------------------------------------------------------------------
// Frontmatter parsing. Deliberately small — we only read scalars, string
// arrays, and the `faq:` list of q/a pairs.
// ---------------------------------------------------------------------------

function splitFile(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: '', body: raw };
  return { fm: m[1], body: raw.slice(m[0].length) };
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
  let v = line[1].trim();
  if (v === '>' || v === '|' || v === '>-' || v === '|-') {
    const after = fm.slice(fm.indexOf(line[0]) + line[0].length);
    const block = [];
    for (const l of after.split('\n').slice(1)) {
      if (!/^\s+\S/.test(l)) break;
      block.push(l.trim());
    }
    return block.join(' ');
  }
  return v ? unquote(v) : '';
}

/** Parse the `faq:` block into [{q, a}]. */
function parseFaq(fm) {
  const start = fm.search(/^faq:\s*$/m);
  if (start === -1) return [];
  const lines = fm.slice(start).split('\n').slice(1);
  const items = [];
  let cur = null;
  for (const line of lines) {
    if (/^\S/.test(line)) break; // dedented back to a new top-level key
    const q = line.match(/^\s*-\s*q:\s*(.+)$/);
    const a = line.match(/^\s*a:\s*(.+)$/);
    if (q) {
      if (cur) items.push(cur);
      cur = { q: unquote(q[1]), a: '' };
    } else if (a && cur) {
      cur.a = unquote(a[1]);
    } else if (cur && /^\s+\S/.test(line) && cur.a) {
      cur.a += ' ' + line.trim(); // folded continuation
    }
  }
  if (cur) items.push(cur);
  return items;
}

/** Strip code fences, inline code, SVG and frontmatter so we measure prose. */
function proseOf(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/`[^`]*`/g, '');
}

// ---------------------------------------------------------------------------
// Pixel width for the seoTitle rule — reuses check-seo.mjs so the two scripts
// can never disagree about what fits.
// ---------------------------------------------------------------------------
const { titlePx } = await import('./check-seo.mjs');
const BRAND_SUFFIX = ' | MSDEVBUILD by Suthahar';

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function keywordOf(file, title) {
  // The slug is the deliberate keyword statement — it's chosen, not incidental.
  const slug = basename(file).replace(/\.mdx?$/, '');
  const terms = slug.split('-').filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return { slug, terms, title };
}

function analyse(file) {
  const raw = readFileSync(file, 'utf8');
  const { fm, body } = splitFile(raw);
  const prose = proseOf(body);

  const title = scalar(fm, 'title') ?? '';
  const draft = /^draft:\s*true\s*$/m.test(fm);
  const faq = parseFaq(fm);
  const highlight = scalar(fm, 'highlight');
  const seoTitle = scalar(fm, 'seoTitle');
  const cover = scalar(fm, 'cover');
  const coverAlt = scalar(fm, 'coverAlt');

  // Headings and images come from `prose`, never `body`: a fenced bash or
  // markdown sample is full of "# comment" lines that are not headings.
  const h1s = [...prose.matchAll(/^#\s+(.+)$/gm)].map((m) => m[1]);
  const h2s = [...prose.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
  const questionH2s = h2s.filter(
    (h) => h.trim().endsWith('?') || /^(what|why|how|when|which|who|can|should|is|does|do|are)\b/i.test(h.trim()),
  );

  const internalLinks = [...prose.matchAll(/\]\((?:\.\.\/|\/blog\/)([a-z0-9-]+)\)/g)].map((m) => m[1]);
  const externalLinks = [...prose.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);

  const images = [...prose.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));
  const mdxImages = [...prose.matchAll(/<Image\b[^>]*>/g)].map((m) => m[0]);

  const leadWords = prose
    .replace(/^#+\s+.*$/gm, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, LEAD_WORDS)
    .join(' ')
    .toLowerCase();

  return {
    file, draft, title, seoTitle, faq, highlight, cover, coverAlt,
    h1s, h2s, questionH2s, internalLinks, externalLinks, images, mdxImages, leadWords,
    keyword: keywordOf(file, title),
  };
}

function checkOne(a, validSlugs) {
  const blocking = [];
  const warnings = [];
  const push = (list, msg) => list.push(msg);

  // --- Answer engines quote FAQ blocks more than any other structure --------
  if (!a.faq.length) {
    push(blocking, `no faq — this is the single highest-value AEO field on the site. Add ${FAQ_MIN}-${FAQ_MAX} real questions; they emit FAQPage schema that answer engines lift verbatim`);
  } else {
    if (a.faq.length < FAQ_MIN) push(blocking, `only ${a.faq.length} faq entries (need ${FAQ_MIN}-${FAQ_MAX})`);
    if (a.faq.length > FAQ_MAX) push(warnings, `${a.faq.length} faq entries — past ${FAQ_MAX} they dilute rather than help`);
    a.faq.forEach(({ q, a: ans }, i) => {
      if (!q.trim().endsWith('?')) push(warnings, `faq #${i + 1} is not phrased as a question ("${q.slice(0, 48)}…")`);
      if (!ans) push(blocking, `faq #${i + 1} has no answer`);
      else if (ans.length < FAQ_ANSWER_MIN_CHARS) push(warnings, `faq #${i + 1} answer is ${ans.length} chars — too thin to be quoted`);
      else if (ans.length > FAQ_ANSWER_MAX_CHARS) push(warnings, `faq #${i + 1} answer is ${ans.length} chars — trim to under ${FAQ_ANSWER_MAX_CHARS} so it stays quotable`);
    });
  }

  // --- The highlight is the passage most likely to be pulled as the answer --
  if (!a.highlight) {
    push(blocking, 'no highlight — this is the passage AI engines quote and the takeaway box readers see. Write the single most useful sentence of the article here');
  } else if (a.highlight.length < HIGHLIGHT_MIN_CHARS) {
    push(warnings, `highlight is only ${a.highlight.length} chars — say something substantive`);
  } else if (a.highlight.length > HIGHLIGHT_MAX_CHARS) {
    push(blocking, `highlight is ${a.highlight.length} chars, over the ${HIGHLIGHT_MAX_CHARS} schema cap`);
  }

  // --- Question headings are how a page wins featured snippets --------------
  if (a.questionH2s.length < QUESTION_HEADINGS_MIN) {
    push(warnings, `${a.questionH2s.length} question-shaped H2 (want >= ${QUESTION_HEADINGS_MIN}) — headings phrased as the exact query a developer types are what snippets match against`);
  }

  // --- Topical authority is built with internal links ----------------------
  const resolved = a.internalLinks.filter((s) => validSlugs.has(s));
  const broken = a.internalLinks.filter((s) => !validSlugs.has(s));
  for (const b of broken) push(blocking, `internal link points at "/blog/${b}" which does not exist — a broken link leaks authority and 404s readers`);
  if (resolved.length < INTERNAL_LINKS_MIN) {
    push(warnings, `${resolved.length} internal link(s) (want >= ${INTERNAL_LINKS_MIN}) — linking related MSDEVBUILD posts is what turns separate articles into a topic cluster that ranks as a set`);
  }
  if (!a.externalLinks.length) {
    push(warnings, 'no outbound links — citing Microsoft Learn / official docs is a trust signal, and answer engines weight cited claims higher');
  }

  // --- Entity: the article must be attributable ----------------------------
  if (!a.cover) {
    push(warnings, 'no cover image — the post falls back to the generic OG image, so every share of it looks unbranded');
  } else if (!a.coverAlt) {
    push(blocking, 'cover is set without coverAlt (schema requires both, and alt text is an indexable description)');
  }
  for (const img of a.images) {
    if (!img.alt.trim()) push(warnings, `image "${img.src}" has empty alt text — invisible to search and to screen readers`);
  }

  // --- Title budget: seoTitle is the escape hatch --------------------------
  const renderedPx = titlePx((a.seoTitle || a.title) + BRAND_SUFFIX);
  if (renderedPx > TITLE_PX_BUDGET && !a.seoTitle) {
    push(warnings, `rendered title is ${renderedPx}px, over the ${TITLE_PX_BUDGET}px limit — set a short "seoTitle" so search shows a clean title while the on-page H1 stays as written`);
  }

  // --- Keyword placement ---------------------------------------------------
  const { terms } = a.keyword;
  if (terms.length) {
    const inTitle = terms.filter((t) => a.title.toLowerCase().includes(t)).length;
    const inLead = terms.filter((t) => a.leadWords.includes(t)).length;
    const inH2 = terms.filter((t) => a.h2s.some((h) => h.toLowerCase().includes(t))).length;
    if (inTitle / terms.length < 0.5) {
      push(warnings, `the title barely matches the slug — slug says "${terms.join(' ')}", title says "${a.title}". Search engines read the mismatch as a weak topic signal`);
    }
    if (inLead === 0) {
      push(warnings, `none of the slug's key terms (${terms.slice(0, 4).join(', ')}) appear in the first ${LEAD_WORDS} words — say what the article is about early, in a sentence a human would write`);
    }
    if (inH2 === 0) {
      push(warnings, `no H2 contains any key term — at least one section heading should name the topic`);
    }
  }

  // --- Structure -----------------------------------------------------------
  if (a.h1s.length) {
    push(warnings, `${a.h1s.length} markdown H1 in the body — the page already renders the title as the H1, so these create a duplicate-H1 structure. Use ## instead`);
  }
  if (a.h2s.length < 3) {
    push(warnings, `only ${a.h2s.length} H2 sections — thin structure is hard for answer engines to segment`);
  }

  return { ...a, blocking, warnings };
}

// ---------------------------------------------------------------------------

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
  const all = walk(BLOG_DIR);
  const validSlugs = new Set(all.map((f) => basename(f).replace(/\.mdx?$/, '')));

  let targets = fileArgs.length
    ? fileArgs.map((f) => (f.startsWith('/') ? f : join(ROOT, f))).filter((f) => EXTS.has(extname(f)))
    : all;
  targets = targets.filter((f) => {
    try {
      return statSync(f).isFile();
    } catch {
      return false;
    }
  });

  const results = targets.map((f) => checkOne(analyse(f), validSlugs));

  if (JSON_MODE) {
    console.log(JSON.stringify(results.map(({ file, draft, blocking, warnings }) => ({ file, draft, blocking, warnings })), null, 2));
    return results.some((r) => !r.draft && r.blocking.length) ? 1 : 0;
  }

  let blockingCount = 0;
  let warnCount = 0;
  let skippedDrafts = 0;

  for (const r of results) {
    // Drafts are advisory only — you are still writing them.
    const gated = !r.draft || INCLUDE_DRAFTS;
    if (r.draft && !INCLUDE_DRAFTS && !fileArgs.length) {
      skippedDrafts++;
      continue;
    }
    if (!r.blocking.length && !r.warnings.length) continue;

    console.log(`\n${relative(ROOT, r.file)}${r.draft ? ' (draft — advisory)' : ''}`);
    for (const m of r.blocking) console.log(`  ${gated && !r.draft ? '✗' : '•'} ${m}`);
    for (const m of r.warnings) console.log(`  • ${m}`);

    if (!r.draft && r.blocking.length) blockingCount++;
    else warnCount++;
  }

  console.log('');
  if (skippedDrafts) console.log(`(${skippedDrafts} draft(s) not gated — run with --all to see them.)`);
  if (blockingCount) {
    console.log(`aeo: ${blockingCount} published post(s) missing required answer-engine fields. Fix, then retry.`);
    console.log('(Drafts are never blocked. These are live pages.)');
    return 1;
  }
  if (warnCount) {
    console.log(`aeo: ${warnCount} post(s) with warnings worth acting on, nothing blocking.`);
  } else {
    console.log('aeo: every published post carries its answer-engine fields. ✓');
  }
  return 0;
}

process.exit(main());
