import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

import { TOPIC_GROUPS, type CategorySlug } from './taxonomy';

/**
 * Category lookup derived from the canonical taxonomy — `hue` colour-codes each
 * topic across the site. Defined here so existing imports keep working, but the
 * data lives in one place (taxonomy.ts).
 */
export const CATEGORIES = Object.fromEntries(
  TOPIC_GROUPS.map((g) => [g.slug, { label: g.label, description: g.description, hue: g.hue }]),
) as Record<CategorySlug, { label: string; description: string; hue: number }>;

export type CategoryId = CategorySlug;

/**
 * Deterministic cover art for posts without an image.
 *
 * Writing a cover graphic for every post is a tax that eventually gets skipped,
 * and text-only cards look dead. Deriving a gradient from the slug gives each
 * post a stable, distinct visual identity for free — same post, same art, every
 * build — while staying inside the category's colour so the page reads as one
 * system rather than confetti.
 */
export function coverArt(slug: string, category: CategoryId) {
  const { hue } = CATEGORIES[category];

  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }

  const drift = (hash % 34) - 17;
  const angle = 115 + (hash % 130);

  return {
    from: `oklch(0.62 0.17 ${hue + drift})`,
    to: `oklch(0.42 0.15 ${hue + drift + 45})`,
    angle,
    // Two decorative circles, placed deterministically within the panel.
    blobs: [
      { x: 15 + (hash % 45), y: 20 + ((hash >> 4) % 40), r: 26 + ((hash >> 8) % 18) },
      { x: 55 + ((hash >> 6) % 35), y: 45 + ((hash >> 10) % 40), r: 16 + ((hash >> 12) % 14) },
    ],
  };
}

/** Drafts are visible in `astro dev` only — never in a production build. */
/**
 * A post is live when it is not a draft AND its publish date has arrived.
 *
 * The date half is what makes scheduling possible. Shipping a finished series
 * all at once reads as a dump; two or three parts a week reads as an active
 * publication, and that is a real ranking difference. So a finished part sits
 * with `draft: false` and a future date, and goes live on its own — the daily
 * scheduled deploy in .github/workflows/deploy.yml rebuilds and picks it up.
 *
 * Dev shows everything, so you can read the whole queue while writing.
 */
export function isLive(data: Post['data'], now = Date.now()): boolean {
  return !data.draft && data.publishedAt.getTime() <= now;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || isLive(data));
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/**
 * Finished, undrafted, but not due yet. These are proofable at /preview like a
 * draft, because "waiting for its date" is exactly when you want a last read.
 */
export async function getScheduledPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !isLive(data));
  return posts.sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime());
}

/**
 * Draft posts only — used by the /preview route so the admin can proof
 * unpublished work on the live domain. These pages are built into production
 * (unlike getPublishedPosts, which drops drafts there) but are noindex, kept
 * out of the sitemap, and only listed once the admin is signed in. The pages
 * themselves are still public HTML by URL — the login gate is convenience, not
 * a security boundary, exactly like /admin. Nothing sensitive belongs in a
 * draft on this host.
 */
export async function getDraftPosts(): Promise<Post[]> {
  // Scheduled posts ride along: they are not live yet, so /preview is the only
  // place to read them, and the day before publication is when you want to.
  const posts = await getCollection('blog', ({ data }) => data.draft || !isLive(data));
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getFeaturedPost(): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.data.featured) ?? posts[0];
}

/** Every category a post belongs to — primary first, then cross-listed ones. */
export function postCategories(post: Post): CategoryId[] {
  return [...new Set([post.data.category, ...post.data.categories])] as CategoryId[];
}

export async function getPostsByCategory(category: CategoryId): Promise<Post[]> {
  return (await getPublishedPosts()).filter((p) => postCategories(p).includes(category));
}

export interface SeriesSummary {
  id: string;
  title: string;
  description: string;
  order: number;
  parts: Post[];
  /** Most recently published part — drives the "updated" line on quick links. */
  latest: Post;
}

/**
 * Every series that has at least one published post, reading order first.
 *
 * A series exists as soon as posts reference it, whether or not someone wrote
 * the definition file — so the home page, the blog index and /series all show
 * the same set. Shared here rather than recomputed per page so the three never
 * disagree about what a series is called.
 */
export async function getSeriesIndex(): Promise<SeriesSummary[]> {
  const [definitions, posts] = await Promise.all([
    getCollection('series'),
    getPublishedPosts(),
  ]);

  const ids = [...new Set(posts.map((p) => p.data.series).filter((s): s is string => Boolean(s)))];

  return ids
    .map((id) => {
      const meta = definitions.find((d) => d.id === id);
      const parts = posts
        .filter((p) => p.data.series === id)
        .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));

      return {
        id,
        title: meta?.data.title ?? id.replace(/-/g, ' '),
        description: meta?.data.description ?? '',
        order: meta?.data.order ?? 99,
        parts,
        // getPublishedPosts is newest-first, so the first match is the newest part.
        latest: posts.find((p) => p.data.series === id)!,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Each series has its own page. It used to be an anchor into the one long
 * /series list, which meant the whole topic had no URL of its own — nothing for
 * a search engine to rank for "azure ai foundry agents", and nothing for an
 * answer engine to cite as the source for the topic rather than one part of it.
 */
export function seriesUrl(id: string): string {
  return `/series/${id}`;
}

export async function getPostsInSeries(seriesId: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts
    .filter((p) => p.data.series === seriesId)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

/** Tag slug -> { label, count }, sorted by frequency then alphabetically. */
export async function getAllTags() {
  const posts = await getPublishedPosts();
  const counts = new Map<string, { label: string; count: number }>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      const existing = counts.get(slug);
      if (existing) existing.count++;
      else counts.set(slug, { label: tag, count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Related posts, ranked: same series first, then shared-tag overlap,
 * then same category. Keeps readers moving between posts, which is
 * also what builds topical authority.
 */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const all = (await getPublishedPosts()).filter((p) => p.id !== post.id);
  const tags = new Set(post.data.tags.map(slugifyTag));

  return all
    .map((candidate) => {
      let score = 0;
      if (post.data.series && candidate.data.series === post.data.series) score += 100;
      score += candidate.data.tags.filter((t) => tags.has(slugifyTag(t))).length * 10;
      if (candidate.data.category === post.data.category) score += 3;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.data.publishedAt.getTime() - a.candidate.data.publishedAt.getTime())
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

/** Newest-first neighbours for prev/next navigation. */
export async function getAdjacentPosts(post: Post) {
  const posts = await getPublishedPosts();
  const i = posts.findIndex((p) => p.id === post.id);
  return {
    newer: i > 0 ? posts[i - 1] : undefined,
    older: i >= 0 && i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

export interface NextRead {
  post: Post;
  /** Why this post was picked — the page uses it to pick the eyebrow copy. */
  kind: 'series' | 'related' | 'recent';
  /** Eyebrow text, e.g. "Next in this series · Part 3 of 6". */
  label: string;
}

/**
 * The single post to hand the reader at the end of this one, plus the one
 * behind them.
 *
 * A reader who finished the article is at the point of highest intent, and the
 * date-ordered prev/next that used to sit here answered the wrong question: on
 * a multi-part guide "the post published just before this one" is rarely part
 * two. So the next link resolves in the order the reader actually thinks in —
 * the next part of the series they're in, then the closest related post, and
 * only then the neighbour by date. One destination, not a grid of six, because
 * a single obvious next step is what gets clicked.
 */
export async function getNextRead(post: Post): Promise<{ next?: NextRead; prev?: NextRead }> {
  let next: NextRead | undefined;
  let prev: NextRead | undefined;

  if (post.data.series) {
    const parts = await getPostsInSeries(post.data.series);
    const i = parts.findIndex((p) => p.id === post.id);

    if (i >= 0) {
      const after = parts[i + 1];
      const before = parts[i - 1];

      if (after) {
        next = {
          post: after,
          kind: 'series',
          label: `Next in this series · Part ${i + 2} of ${parts.length}`,
        };
      }
      if (before) {
        prev = {
          post: before,
          kind: 'series',
          label: `Part ${i} of ${parts.length}`,
        };
      }
    }
  }

  // Last part of a series, or not in one at all: the strongest related post.
  if (!next) {
    const [related] = await getRelatedPosts(post, 1);
    if (related) next = { post: related, kind: 'related', label: 'Read next' };
  }

  const { newer, older } = await getAdjacentPosts(post);

  // Nothing shares a series, a tag, or a category — fall back to the neighbour.
  if (!next && older) next = { post: older, kind: 'recent', label: 'Read next' };

  if (!prev) {
    const back = [older, newer].find((p) => p && p.id !== next?.post.id);
    if (back) prev = { post: back, kind: 'recent', label: 'Previously' };
  }

  return { next, prev };
}

/**
 * Drop author-only notes from a raw post body.
 *
 * MDX `{/* … *\/}` and Markdown `<!-- … -->` comments never reach the rendered
 * page, but `post.body` is the unrendered source. Anywhere we hand that source
 * to something that reads it as article text — the Markdown twin for AI
 * crawlers, the on-page chat — the notes have to come out first, or a
 * screenshot TODO ends up quoted back as if it were part of the article.
 */
export function stripAuthorNotes(body: string): string {
  return body
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

/** 200 wpm, rounded up, with code blocks discounted since they're scanned not read. */
export function readingTime(body: string): number {
  const withoutCode = body.replace(/```[\s\S]*?```/g, ' ');
  const codeLines = (body.match(/```[\s\S]*?```/g) ?? []).join('\n').split('\n').length;
  const words = withoutCode.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200 + codeLines / 60));
}

export function postUrl(post: Post): string {
  return `/blog/${post.id}/`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function isoDate(date: Date): string {
  return date.toISOString();
}
