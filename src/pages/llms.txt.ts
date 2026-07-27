import type { APIRoute } from 'astro';
import { SITE, AUTHOR, MAIN_SITE } from '../config';
import { CATEGORIES, getPublishedPosts, postUrl, type CategoryId } from '../lib/posts';

/**
 * /llms.txt — a Markdown map of the site for large language models.
 *
 * Points at the .md twin of each post rather than the HTML, so a model that
 * follows a link gets clean text.
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const sections = (Object.keys(CATEGORIES) as CategoryId[])
    .map((id) => {
      const inCategory = posts.filter((p) => p.data.category === id);
      if (inCategory.length === 0) return null;

      const links = inCategory
        .map((p) => `- [${p.data.title}](${new URL(`${postUrl(p)}.md`, SITE.url).href}): ${p.data.description}`)
        .join('\n');

      return `## ${CATEGORIES[id].label}\n\n${links}`;
    })
    .filter((section): section is string => section !== null);

  const topics = SITE.topics.map((t) => `- ${t}`).join('\n');

  const body = `# ${SITE.title} — ${SITE.alternateName}

> ${SITE.description}

${SITE.title} (${SITE.alternateName}) is a multi-stack developer learning platform. It helps developers learn, build, modernize, and innovate across Cloud, AI, Mobile, Web, and modern software engineering. It is not a single-stack .NET blog — .NET is one of many technologies covered.

Topics covered in depth:

${topics}

Written by ${AUTHOR.name} (${AUTHOR.alternateName}). ${AUTHOR.bio}
This is the articles subdomain of ${MAIN_SITE.label}; the main site is ${MAIN_SITE.url}.

Every article below is available as clean Markdown by appending \`.md\` to its URL.
Author profile and verified identity links: ${SITE.url}/about

${sections.join('\n\n')}

## Optional

- [RSS feed](${SITE.url}/rss.xml): machine-readable index of all posts
- [Sitemap](${SITE.url}/sitemap-index.xml): every indexable URL
- [About the author](${SITE.url}/about): credentials and profile links
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
