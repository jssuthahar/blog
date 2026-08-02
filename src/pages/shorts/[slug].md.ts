import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE, AUTHOR } from '../../config';
import { shortUrl, getShorts, type Short } from '../../lib/shorts';
import { CATEGORIES } from '../../lib/posts';

/**
 * Markdown twin of every short video.
 *
 * These pages have an unusual problem: the thing being explained is an
 * short, which an assistant cannot watch. The steps written on the HTML
 * page are the whole explanation, so serving them as clean Markdown — linked
 * from the page via <link rel="alternate" type="text/markdown"> — gives a model
 * the complete content of a short it can never play.
 */
export const getStaticPaths: GetStaticPaths = () =>
  getShorts().map((short) => ({
    params: { slug: short.slug },
    props: { short },
  }));

export const GET: APIRoute = ({ props }) => {
  const short = props.short as Short;
  const url = new URL(shortUrl(short), SITE.url).href;

  const header = [
    `# ${short.title}`,
    '',
    `> ${short.sub}`,
    '',
    `- **Format:** short video, ${short.stages.length} steps, ~${short.seconds} seconds`,
    `- **Topic:** ${short.topic}`,
    `- **Author:** ${AUTHOR.name} (${AUTHOR.alternateName})`,
    `- **Category:** ${CATEGORIES[short.category].label} · ${short.folderLabel}`,
    short.tags.length ? `- **Tags:** ${short.tags.join(', ')}` : null,
    `- **Canonical URL:** ${url}`,
    '',
    '---',
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const steps = short.stages
    .map((stage, index) => `### ${index + 1}. ${stage.title}\n\n${stage.desc}`)
    .join('\n\n');

  const body = `${header}## Understand it one step at a time

${steps}

---

## The takeaway

**${short.end.title}**

${short.end.sub}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
