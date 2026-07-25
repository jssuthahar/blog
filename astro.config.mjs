// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.msdevbuild.com',
  trailingSlash: 'ignore',

  integrations: [
    mdx(),
    sitemap({
      // Pages marked noindex must not be advertised in the sitemap either —
      // submitting a URL you also tell crawlers to ignore is a contradiction.
      filter: (page) =>
        !page.includes('/draft/') &&
        !page.includes('/preview') &&
        !page.includes('/admin') &&
        !page.includes('/write') &&
        !page.includes('/search'),
    }),
  ],

  markdown: {
    // Astro adds heading ids already; this makes them linkable.
    rehypePlugins: [
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { class: 'heading-anchor', ariaHidden: 'true', tabIndex: -1 },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
    shikiConfig: {
      // Dual themes so code blocks follow the site theme with zero runtime JS.
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },

  image: {
    // Cover images are wide; cap the work Sharp does at build time.
    responsiveStyles: true,
    layout: 'constrained',
  },

  vite: {
    // Cast: Astro bundles its own Vite copy, so the plugin's Vite types
    // resolve to a different (structurally identical) declaration.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
