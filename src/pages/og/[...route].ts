import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../config';
import { CATEGORIES, readingTime } from '../../lib/posts';
import { getShorts } from '../../lib/shorts';
import { renderOGCard, type OGCardOptions, type OGOutput } from '../../lib/og-card';

/**
 * Every post gets its own share image, plus a site-wide "default" used by the
 * home page and any page that doesn't set its own image. Generated at build
 * time — no runtime cost, no external service.
 *
 *   /og/<id>.png         1200×630 PNG — the social share card.
 *   /og/w800/<id>.webp   the same drawing, downsampled: the post's thumbnail
 *   /og/w1200/<id>.webp  on cards across the site, for posts with no cover.
 *
 * Drafts get cards in `astro dev` only — they show on the dev blog index, and
 * proofing a post against a broken thumbnail is no way to check a design. They
 * are left out of production builds, where nothing links to them and 21 unused
 * share cards would be ~4MB of dead weight in the deploy.
 *
 * The card itself is drawn in lib/og-card.ts.
 */
const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
const publishedCount = posts.filter((p) => !p.data.draft).length;
const shorts = getShorts();

/** Widths the site's thumbnails ask for — one per srcset candidate. */
const THUMB_WIDTHS = [800, 1200] as const;
type ThumbWidth = (typeof THUMB_WIDTHS)[number];

const cards: Record<string, OGCardOptions> = {
  default: {
    title: 'Cloud, AI, Mobile & Web — built and explained',
    description: SITE.description,
    eyebrow: 'Developer platform',
    meta: `${publishedCount} hands-on articles`,
  },
  ...Object.fromEntries(
    posts.map((post) => {
      const category = CATEGORIES[post.data.category];
      return [
        post.id,
        {
          title: post.data.title,
          description: post.data.description,
          eyebrow: category.label,
          hue: category.hue,
          // Reading time rather than the publish date: a share card is seen
          // long after publication, and "12 min read" ages better than a
          // month that makes the post look stale.
          meta: `${readingTime(post.body ?? '')} min read`,
        } satisfies OGCardOptions,
      ];
    }),
  ),

  // The short videos. One shared to LinkedIn or WhatsApp needs a still that
  // says what it is — a preview never plays, so the card carries the step
  // count and the runtime instead.
  shorts: {
    title: 'One engineering idea, in about 30 seconds',
    description:
      'Short videos on Azure, AI, Python and architecture — one idea each, played out step by step, and written out underneath.',
    eyebrow: 'Short videos',
    meta: `${shorts.length} short videos`,
  },
  ...Object.fromEntries(
    shorts.map((short) => {
      const category = CATEGORIES[short.category];
      return [
        `short-${short.slug}`,
        {
          title: short.title,
          description: short.sub,
          eyebrow: category.label,
          hue: category.hue,
          meta: `${short.stages.length} steps · ${short.seconds}s`,
        } satisfies OGCardOptions,
      ];
    }),
  ),
};

export function getStaticPaths() {
  const ids = Object.keys(cards);
  return [
    ...ids.map((id) => ({ params: { route: `${id}.png` } })),
    ...THUMB_WIDTHS.flatMap((w) => ids.map((id) => ({ params: { route: `w${w}/${id}.webp` } }))),
  ];
}

export const GET: APIRoute = async ({ params }) => {
  const route = params.route ?? '';
  const thumb = route.match(/^w(\d+)\/(.+)\.webp$/);

  const card = cards[thumb ? thumb[2] : route.replace(/\.png$/, '')];
  if (!card) return new Response('Not found', { status: 404 });

  const width = Number(thumb?.[1]);
  if (thumb && !THUMB_WIDTHS.includes(width as ThumbWidth)) {
    return new Response('Not found', { status: 404 });
  }

  const output: OGOutput = thumb ? { width, format: 'webp', quality: 82 } : {};
  const image = await renderOGCard(card, output);

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': thumb ? 'image/webp' : 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
