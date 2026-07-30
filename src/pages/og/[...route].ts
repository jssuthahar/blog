import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../config';
import { CATEGORIES, readingTime } from '../../lib/posts';
import { renderOGCard, type OGCardOptions } from '../../lib/og-card';

/**
 * Every published post gets its own share image, plus a site-wide "default"
 * used by the home page and any page that doesn't set its own image. Generated
 * at build time into /og/<id>.png — no runtime cost, no external service.
 *
 * The card itself is drawn in lib/og-card.ts.
 */
const posts = await getCollection('blog', ({ data }) => !data.draft);

const cards: Record<string, OGCardOptions> = {
  default: {
    title: 'Cloud, AI, Mobile & Web — built and explained',
    description: SITE.description,
    eyebrow: 'Developer platform',
    meta: `${posts.length} hands-on articles`,
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
};

export function getStaticPaths() {
  return Object.keys(cards).map((id) => ({ params: { route: `${id}.png` } }));
}

export const GET: APIRoute = async ({ params }) => {
  const id = (params.route ?? '').replace(/\.png$/, '');
  const card = cards[id];
  if (!card) return new Response('Not found', { status: 404 });

  const png = await renderOGCard(card);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
