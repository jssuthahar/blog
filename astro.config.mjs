// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * `<slug> -> { publishedAt, updatedAt }` for blog posts and shorts, read
 * straight off disk rather than through `astro:content` — that virtual module
 * isn't resolvable yet from inside `astro.config.mjs`, which runs before the
 * content layer exists.
 *
 * Only the two date fields are pulled, with a plain regex rather than a real
 * YAML parse: `content.config.ts` guarantees every post has `publishedAt` as
 * a bare scalar on its own line, and reading just that line is safe
 * regardless of how nested the rest of a post's frontmatter (the `faq`
 * array) gets. This is what feeds `lastmod` in the sitemap below — real
 * freshness data instead of a build-time timestamp copied onto every URL.
 */
/** @param {string} raw */
function frontmatterDates(raw) {
  // Normalize CRLF first — posts are authored on Windows as often as not, and
  // every pattern below assumes a bare `\n`.
  const text = raw.replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  /** @param {string} name */
  const field = (name) => match[1].match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  return { publishedAt: field('publishedAt'), updatedAt: field('updatedAt') };
}

function readBlogDates() {
  const dates = new Map();
  /** @param {string} dir */
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(md|mdx)$/.test(entry.name)) {
        const { publishedAt, updatedAt } = frontmatterDates(readFileSync(full, 'utf-8'));
        if (publishedAt) dates.set(entry.name.replace(/\.(md|mdx)$/, ''), { publishedAt, updatedAt });
      }
    }
  };
  walk(path.join(rootDir, 'src/content/blog'));
  return dates;
}

function readShortDates() {
  const dates = new Map();
  const baseDir = path.join(rootDir, 'src/content/Real');
  for (const folder of readdirSync(baseDir, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    const folderPath = path.join(baseDir, folder.name);
    for (const file of readdirSync(folderPath)) {
      if (!file.endsWith('.spec.json')) continue;
      try {
        const spec = JSON.parse(readFileSync(path.join(folderPath, file), 'utf-8'));
        if (spec.publishedAt) {
          dates.set(spec.slug || file.replace(/\.spec\.json$/, ''), {
            publishedAt: spec.publishedAt,
            updatedAt: spec.updatedAt,
          });
        }
      } catch {
        // Malformed spec — `lib/shorts.ts` already warns loudly for this at
        // build time; the sitemap just skips lastmod for it.
      }
    }
  }
  return dates;
}

const blogDates = readBlogDates();
const shortDates = readShortDates();

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
        !page.includes('/search') &&
        !page.includes('/history') &&
        !page.includes('/events/new'),
      // Real per-URL freshness for posts and shorts, sourced from their own
      // `publishedAt`/`updatedAt` — not a build timestamp stamped onto every
      // URL alike, which is worse than no lastmod at all.
      serialize(item) {
        const parts = new URL(item.url).pathname.split('/').filter(Boolean);
        const table = parts[0] === 'blog' ? blogDates : parts[0] === 'shorts' ? shortDates : null;
        const dates = table?.get(parts[1]);
        if (!dates) return item;
        return { ...item, lastmod: new Date(dates.updatedAt ?? dates.publishedAt).toISOString() };
      },
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
