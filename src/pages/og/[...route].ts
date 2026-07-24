import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE } from '../../config';

// Every published post gets its own share image, plus a site-wide "default"
// used by the home page and any page that doesn't set its own image. Generated
// at build time into /og/<id>.png — no runtime cost, no external service.
const posts = await getCollection('blog', ({ data }) => !data.draft);

const pages: Record<string, { title: string; description: string }> = {
  default: { title: SITE.title, description: SITE.tagline },
  ...Object.fromEntries(
    posts.map((post) => [
      post.id,
      { title: post.data.title, description: post.data.description },
    ]),
  ),
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_id, page) => ({
    title: page.title,
    description: page.description,
    // Deep navy gradient with the site's blue accent as a left spine — the same
    // restrained palette as the site itself.
    bgGradient: [
      [18, 24, 38],
      [30, 41, 66],
    ],
    border: { color: [47, 106, 217], width: 24, side: 'inline-start' },
    padding: 70,
    font: {
      title: {
        color: [255, 255, 255],
        weight: 'Bold',
        size: 64,
        lineHeight: 1.15,
      },
      description: {
        color: [176, 186, 204],
        size: 30,
        lineHeight: 1.4,
      },
    },
    // Bold + regular weights so the title renders heavier than the description.
    fonts: [
      'https://api.fontsource.org/v1/fonts/noto-sans/latin-700-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans/latin-400-normal.ttf',
    ],
  }),
});
