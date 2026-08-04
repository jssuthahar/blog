/**
 * The app feed — one scrolling column of shorts, blog posts, syndicated
 * articles and promotions, assembled at build time.
 *
 * The old /app was three separate strips: a shorts rail, a series rail, then a
 * column of article cards. Three strips means three decisions before anything
 * is watched or read, and the shorts — the thing most likely to stop a thumb —
 * were the smallest tiles on the screen. This replaces that with a single feed
 * a reader can stay in, where the next item is always already decided for them.
 *
 * The mix matters more than the order of any one item. A feed of only shorts
 * teaches a reader that this is a video app and they leave when the videos run
 * out; a feed of only articles is a blog index with extra scrolling. Alternating
 * them means a thirty-second watch is always one swipe from the twelve-minute
 * version of the same subject, which is the whole point of publishing both.
 *
 * Everything here is server-side and static. The client's only job is deciding
 * which item is on screen — see the script on /app.
 */
import {
  ADSENSE_LAYOUT_KEY_IN_FEED,
  ADSENSE_SLOT_DISPLAY,
  ADSENSE_SLOT_IN_FEED,
  SOCIAL,
} from '../config';
import { allArticles, normaliseCategory, primaryCategory, type Article } from './articles';
import { CATEGORIES, postUrl, readingTime, type CategoryId, type Post } from './posts';
import { getShorts, shortUrl, type Short } from './shorts';

/** The four filter tabs, and the value each item carries in `data-kind`. */
export type FeedKind = 'short' | 'blog' | 'article' | 'promo';

/** Where "Learn more" on a short goes, and what the button says. */
export interface LearnMore {
  href: string;
  label: string;
  /** Shown under the button — the title of the thing being linked to. */
  context: string;
}

export interface ShortItem {
  kind: 'short';
  short: Short;
  learnMore: LearnMore;
}

export interface BlogItem {
  kind: 'blog';
  post: Post;
  minutes: number;
  url: string;
}

export interface ArticleItem {
  kind: 'article';
  article: Article;
  categoryLabel: string;
  /** Hue borrowed from the site taxonomy when the label maps to a category. */
  hue: number;
  /** Publication date, preformatted — the card never ships a date parser. */
  dateLabel: string;
}

/**
 * A promotion slot.
 *
 * `social` and `newsletter` are asks the reader can act on in place; `ad` is
 * the AdSense unit. They share a slot type because they compete for the same
 * scarce thing — the gap between two items a reader was enjoying — and mixing
 * them in one rotation is what keeps either from becoming the pattern.
 */
export interface PromoItem {
  kind: 'promo';
  promo:
    | { type: 'social'; id: string; icon: string; label: string; handle: string; action: string; blurb: string; href: string }
    | { type: 'newsletter' }
    | { type: 'install' }
    | { type: 'ad'; slot: string; format: 'in-feed' | 'display'; layoutKey?: string };
}

export type FeedItem = ShortItem | BlogItem | ArticleItem | PromoItem;

/**
 * How much of each source the feed carries.
 *
 * Shorts are capped hardest, and not for taste. Each one embeds a complete
 * player — its own CSS, sequencer and audio engine — by `srcdoc`, which is
 * about 100KB of markup and 29KB over the wire per short, paid whether or not
 * that short is ever watched. There is deliberately no URL that serves a player
 * as a file (see lib/shorts.ts), so it cannot be fetched on demand instead.
 *
 * Six keeps /app around 170KB gzipped, most of it players. Anyone still
 * scrolling after six has told us they want shorts, and the end card sends them
 * to /shorts, where they arrive one page at a time.
 */
const MAX_SHORTS = 6;
const MAX_POSTS = 12;
const MAX_ARTICLES = 10;

/**
 * One promotion per five pieces of content.
 *
 * Frequent enough to be seen by anyone who scrolls, rare enough that four
 * items in a row are always the thing the reader came for. The first promotion
 * lands at position six, never earlier — a feed that asks for a follow before
 * it has shown anything worth following has nothing to trade.
 */
const PROMO_EVERY = 5;

/**
 * The repeating shape of the content column: a short, then something to read,
 * then a short again. Shorts sit on every other beat because they are the
 * cheapest thing to say yes to, and each one is a doorway into the long-form
 * item beside it.
 *
 * When a queue runs dry — there will always be far more articles than shorts —
 * the slot is filled from whatever is left, in this preference order, rather
 * than skipped. A feed with gaps in it reads as broken.
 */
const PATTERN: Exclude<FeedKind, 'promo'>[] = ['short', 'blog', 'short', 'article'];
const FALLBACK: Exclude<FeedKind, 'promo'>[] = ['blog', 'article', 'short'];

/**
 * The promotion rotation.
 *
 * Ordered by what a reader who has just watched something is most likely to
 * act on: Instagram first, because the shorts are drawn at 1080×1920 and that
 * is the feed they were made for. The ad sits third rather than first — the
 * network's recommendation should never be the first thing the feed asks for.
 */
const PROMO_ORDER = ['instagram', 'ad', 'linkedin', 'newsletter', 'whatsapp', 'ad', 'linkedin-page', 'youtube'] as const;

const adNative = Boolean(ADSENSE_SLOT_IN_FEED && ADSENSE_LAYOUT_KEY_IN_FEED);

function adPromo(): PromoItem['promo'] | null {
  const slot = adNative ? ADSENSE_SLOT_IN_FEED : ADSENSE_SLOT_DISPLAY;
  if (!slot) return null;
  return adNative
    ? { type: 'ad', slot, format: 'in-feed', layoutKey: ADSENSE_LAYOUT_KEY_IN_FEED }
    : { type: 'ad', slot, format: 'display' };
}

function promoAt(index: number): PromoItem | null {
  const id = PROMO_ORDER[index % PROMO_ORDER.length];

  if (id === 'ad') {
    const promo = adPromo();
    // No configured slot means no ad card at all, rather than an empty frame
    // sitting between two items the reader wanted.
    return promo ? { kind: 'promo', promo } : { kind: 'promo', promo: { type: 'newsletter' } };
  }
  if (id === 'newsletter') return { kind: 'promo', promo: { type: 'newsletter' } };

  const social = SOCIAL.find((s) => s.id === id);
  if (!social) return null;
  return {
    kind: 'promo',
    promo: {
      type: 'social',
      id: social.id,
      icon: social.icon,
      label: social.label,
      handle: social.handle,
      action: social.action,
      blurb: social.blurb,
      href: social.href,
    },
  };
}

/**
 * Words that pass a length filter but carry no subject at all. Without this a
 * short and a post "match" on `your`, `with` and `into`, which is how a video
 * about Durable Functions replay ends up recommending a Bicep article.
 */
const STOPWORDS = new Set([
  'about', 'after', 'again', 'also', 'because', 'been', 'before', 'being', 'both', 'built',
  'does', 'doing', 'down', 'each', 'even', 'ever', 'every', 'from', 'gets', 'guide', 'have',
  'here', 'how', 'into', 'inside', 'just', 'know', 'like', 'made', 'make', 'makes', 'many',
  'more', 'most', 'much', 'must', 'need', 'needs', 'next', 'once', 'only', 'other', 'over',
  'part', 'same', 'should', 'since', 'some', 'still', 'take', 'takes', 'than', 'that', 'them',
  'then', 'there', 'these', 'they', 'thing', 'things', 'this', 'those', 'time', 'times', 'under',
  'used', 'uses', 'using', 'very', 'want', 'were', 'what', 'when', 'where', 'which', 'while',
  'will', 'with', 'without', 'work', 'works', 'would', 'your',
]);

function subjectWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9#+.]+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
  );
}

/**
 * Where a short's "Learn more" button goes.
 *
 * Three answers, in descending order of confidence:
 *
 * 1. The post named in the spec's `article` field. An author who wrote both
 *    knows which pair belongs together, and nothing here should second-guess it.
 * 2. A published post that is demonstrably about the same thing — same category
 *    AND either a shared tag or two distinct subject words. The conjunction is
 *    the whole point: category alone would hand every Azure short whichever
 *    Azure post published last, which is worse than no button, because it
 *    teaches a reader that this button does not lead anywhere useful.
 * 3. The short's own page, which carries every stage written out as prose plus
 *    its related reading. That is a real destination, so the button is never
 *    missing and never a dead end.
 */
export function learnMoreFor(short: Short, posts: Post[]): LearnMore {
  const named = short.articleSlug ? posts.find((p) => p.id === short.articleSlug) : undefined;
  if (named) {
    return { href: postUrl(named), label: 'Read the full article', context: named.data.title };
  }

  const words = subjectWords(`${short.topic} ${short.title} ${short.sub}`);
  const tags = new Set(short.tags.map((t) => t.toLowerCase()));

  let best: { post: Post; score: number } | undefined;

  for (const post of posts) {
    if (post.data.category !== short.category) continue;

    const tagHits = (post.data.tags ?? []).filter((t) => tags.has(t.toLowerCase())).length;
    // Distinct words only — a post that says "orchestrator" five times is not
    // five times more relevant than one that says it once.
    const shared = [...subjectWords(`${post.data.title} ${post.data.description}`)].filter((w) =>
      words.has(w),
    ).length;

    if (tagHits === 0 && shared < 2) continue;

    const score = tagHits * 3 + shared;
    if (!best || score > best.score) best = { post, score };
  }

  if (best) {
    return {
      href: postUrl(best.post),
      label: 'Read the full article',
      context: best.post.data.title,
    };
  }

  return {
    href: shortUrl(short),
    label: 'Read the full explanation',
    context: `Every step written out, plus deeper reading on ${CATEGORIES[short.category].label}`,
  };
}

/** Category hue for a Blogger label, when it names one of the site's own. */
function hueForLabel(label: string): number {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '') as CategoryId;
  const match = Object.entries(CATEGORIES).find(([id]) => id === slug);
  if (match) return match[1].hue;

  // Otherwise a stable hue derived from the label, so "Xamarin" is the same
  // colour on every card and every build without needing a taxonomy entry.
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return hash % 360;
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Builds the feed.
 *
 * `posts` is passed in rather than fetched here so the page keeps its single
 * `getPublishedPosts()` call — the feed and anything else on /app read the same
 * list.
 */
export function buildFeed(posts: Post[]): FeedItem[] {
  const shorts = getShorts().slice(0, MAX_SHORTS);
  const blogs = posts.slice(0, MAX_POSTS);
  const articles = allArticles().slice(0, MAX_ARTICLES);

  const queues: Record<Exclude<FeedKind, 'promo'>, FeedItem[]> = {
    short: shorts.map((short) => ({ kind: 'short', short, learnMore: learnMoreFor(short, posts) })),
    blog: blogs.map((post) => ({
      kind: 'blog',
      post,
      minutes: readingTime(post.body ?? ''),
      url: postUrl(post),
    })),
    article: articles.map((article) => {
      const label = normaliseCategory(primaryCategory(article));
      return {
        kind: 'article',
        article,
        categoryLabel: label,
        hue: hueForLabel(label),
        dateLabel: DATE.format(new Date(article.published)),
      };
    }),
  };

  const feed: FeedItem[] = [];
  let slot = 0;
  let content = 0;
  let promos = 0;
  let newsletterPlaced = false;

  while (queues.short.length + queues.blog.length + queues.article.length > 0) {
    const wanted = PATTERN[slot % PATTERN.length];
    slot++;

    const from = queues[wanted].length > 0 ? wanted : FALLBACK.find((k) => queues[k].length > 0);
    if (!from) break;

    feed.push(queues[from].shift()!);
    content++;

    if (content % PROMO_EVERY === 0) {
      // The newsletter card is a form with ids derived from its source, so a
      // second one on the page would be duplicate ids and a label pointing at
      // the wrong input. Skip past a repeat rather than render it — the
      // rotation is long enough that there is always something else to ask.
      let promo = promoAt(promos);
      while (promo?.promo.type === 'newsletter' && newsletterPlaced) {
        promos++;
        promo = promoAt(promos);
        if (promos > PROMO_ORDER.length * 2) break;
      }

      if (promo) {
        if (promo.promo.type === 'newsletter') newsletterPlaced = true;
        feed.push(promo);
        promos++;
      }
    }
  }

  return feed;
}

/** Live counts for the filter tabs, so a tab never opens onto nothing. */
export function feedCounts(feed: FeedItem[]): Record<'all' | 'short' | 'blog' | 'article', number> {
  return {
    all: feed.filter((i) => i.kind !== 'promo').length,
    short: feed.filter((i) => i.kind === 'short').length,
    blog: feed.filter((i) => i.kind === 'blog').length,
    article: feed.filter((i) => i.kind === 'article').length,
  };
}
