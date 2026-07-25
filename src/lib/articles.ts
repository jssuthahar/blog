import data from '../data/articles.json';

/**
 * The article library published on the main site, synced from its Blogger
 * feed by scripts/sync-blogger.mjs.
 */

export interface Article {
  title: string;
  url: string;
  published: string;
  updated: string;
  categories: string[];
  excerpt: string;
  image: string | null;
  comments: number;
}

export interface ArticleIndex {
  source: string;
  blogTitle: string;
  syncedAt: string;
  count: number;
  posts: Article[];
}

export const articleIndex = data as ArticleIndex;

export function allArticles(): Article[] {
  return articleIndex.posts;
}

/** Category -> count, most used first. Drives the filter chips. */
export function articleCategories(minCount = 3) {
  const counts = new Map<string, number>();

  for (const article of articleIndex.posts) {
    // De-duplicate after aliasing, so an article labelled both "Azure" and
    // "Azur" is not counted twice.
    for (const category of new Set(article.categories.map(normaliseCategory))) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .map(([label, count]) => ({ label, count, slug: slugifyCategory(label) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function slugifyCategory(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Corrections for labels typed inconsistently in Blogger over the years.
 * Applied at read time so the source feed is never rewritten.
 */
const CATEGORY_ALIASES: Record<string, string> = {
  Azur: 'Azure',
  'Azure AI': 'Azure',
  'C# Tips': 'C#',
  MicrosoftAI: 'AI',
};

const OVERFLOW = 'More';

export function normaliseCategory(label: string): string {
  return CATEGORY_ALIASES[label] ?? label;
}

/** The first label an article carries is treated as its home category. */
export function primaryCategory(article: Article): string {
  const first = article.categories[0];
  return first ? normaliseCategory(first) : OVERFLOW;
}

/**
 * Compact `data-capture` payload for an off-site article link. Short keys keep
 * the attribute small; the site-wide ArticleCapture listener reads it and logs
 * a reading-history entry when the reader clicks through.
 */
export function capturePayload(a: {
  title: string;
  url: string;
  category: string;
  image: string | null;
}): string {
  return JSON.stringify({ t: a.title, u: a.url, c: a.category, i: a.image ?? '' });
}

/**
 * Groups articles under one category each, largest section first.
 *
 * Grouping by primary category rather than by every label keeps each article
 * in exactly one place — listing a post under all of its labels would repeat
 * the same title down the page. Categories too small to justify a heading are
 * folded into a single trailing section instead of leaving a tail of
 * one-item groups.
 */
export function groupByCategory(articles: Article[], minSize = 4) {
  const groups = new Map<string, Article[]>();

  for (const article of articles) {
    const key = primaryCategory(article);
    groups.set(key, [...(groups.get(key) ?? []), article]);
  }

  const overflow = groups.get(OVERFLOW) ?? [];
  groups.delete(OVERFLOW);

  const kept: [string, Article[]][] = [];

  for (const [label, items] of groups) {
    if (items.length >= minSize) kept.push([label, items]);
    else overflow.push(...items);
  }

  kept.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  if (overflow.length > 0) {
    overflow.sort((a, b) => +new Date(b.published) - +new Date(a.published));
    kept.push([OVERFLOW, overflow]);
  }

  return kept;
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
