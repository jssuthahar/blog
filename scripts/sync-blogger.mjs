#!/usr/bin/env node
/**
 * Syncs the article index from the main site's Blogger feed into a local
 * JSON cache that /articles renders at build time.
 *
 * Why a cache file rather than fetching during the build:
 *   - the build must not fail when Blogger is slow or unreachable
 *   - the cache is committed, so a fresh clone builds offline
 *   - diffs show exactly what changed when the list updates
 *
 * Run with `npm run sync:articles`.
 */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FEED = 'https://www.msdevbuild.com/feeds/posts/default';
const PAGE_SIZE = 150;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'articles.json');

/** Blogger wraps every value as { $t: "..." }. */
const text = (node) => node?.$t ?? '';

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”',
};

function stripHtml(html) {
  return html
    // Comments first: posts start with an SEO notes block, and a naive tag
    // strip leaves fragments of it behind wherever the comment contains '>'.
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Older posts include code samples containing real addresses (MailMessage
 * demos, for one). Excerpts are republished verbatim on this site, so any
 * address is masked before it can reach a page — and a scraper.
 */
function redactEmails(text) {
  return text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]');
}

function excerpt(html, max = 190) {
  const plain = redactEmails(stripHtml(html));
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Blogger serves thumbnails at s72-c; ask for something usable instead. */
function upscale(url) {
  return url
    .replace(/\/s\d+(-c)?\//, '/w640/')
    .replace(/=s\d+(-c)?$/, '=w640');
}

function imageFor(entry) {
  const thumb = entry.media$thumbnail?.url;
  if (thumb) return upscale(thumb);

  // Ignore images referenced inside the SEO comment block.
  const body = text(entry.content).replace(/<!--[\s\S]*?-->/g, ' ');
  const first = body.match(/<img[^>]+src=["']([^"']+)["']/i);
  return first ? upscale(first[1]) : null;
}

async function fetchPage(startIndex) {
  const url = `${FEED}?alt=json&max-results=${PAGE_SIZE}&start-index=${startIndex}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'msdevbuild-blog-sync' } });

  if (!res.ok) throw new Error(`Feed responded ${res.status} for start-index=${startIndex}`);
  return (await res.json()).feed;
}

async function main() {
  const entries = [];
  let startIndex = 1;
  let total = Infinity;
  let blogTitle = '';

  while (entries.length < total) {
    const feed = await fetchPage(startIndex);

    blogTitle ||= text(feed.title);
    total = Number(text(feed.openSearch$totalResults)) || 0;

    const page = feed.entry ?? [];
    if (page.length === 0) break;

    entries.push(...page);
    startIndex += page.length;
    process.stdout.write(`  fetched ${entries.length}/${total}\r`);
  }

  const posts = entries
    .map((entry) => {
      const url = (entry.link ?? []).find((l) => l.rel === 'alternate')?.href;
      if (!url) return null;

      return {
        title: text(entry.title),
        url,
        published: text(entry.published),
        updated: text(entry.updated),
        categories: (entry.category ?? []).map((c) => c.term).filter(Boolean),
        excerpt: excerpt(text(entry.content)),
        image: imageFor(entry),
        comments: Number(entry.thr$total?.$t ?? 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.published) - new Date(a.published));

  const payload = {
    source: FEED,
    blogTitle,
    syncedAt: new Date().toISOString(),
    count: posts.length,
    posts,
  };

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\n✓ ${posts.length} articles → src/data/articles.json`);
}

main().catch(async (error) => {
  console.error(`\n✗ Blogger sync failed: ${error.message}`);

  // Leave the previous cache in place so a failed sync never empties the
  // article list — but exit non-zero so CI surfaces the problem.
  try {
    const existing = JSON.parse(await readFile(OUT, 'utf8'));
    console.error(`  Keeping cached copy from ${existing.syncedAt} (${existing.count} articles).`);
  } catch {
    console.error('  No cached copy exists yet.');
  }

  process.exit(1);
});
