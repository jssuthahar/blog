import { SITE, AUTHOR } from '../config';
import { CATEGORIES, postUrl, stripAuthorNotes, type Post } from './posts';

/**
 * A post as clean Markdown: title, metadata, highlight, body and FAQ.
 *
 * Shared by the per-post twin (/blog/<slug>.md) and /llms-full.txt, so the
 * two can never describe the same article differently.
 */
export function postMarkdown(post: Post): string {
  const { data } = post;
  const url = new URL(postUrl(post), SITE.url).href;

  const frontmatter = [
    `# ${data.title}`,
    '',
    `> ${data.description}`,
    '',
    `- **Author:** ${AUTHOR.name} (${AUTHOR.alternateName})`,
    `- **Published:** ${data.publishedAt.toISOString().slice(0, 10)}`,
    data.updatedAt ? `- **Updated:** ${data.updatedAt.toISOString().slice(0, 10)}` : null,
    `- **Category:** ${CATEGORIES[data.category].label}`,
    data.tags.length ? `- **Tags:** ${data.tags.join(', ')}` : null,
    `- **Canonical URL:** ${url}`,
    '',
    '---',
    '',
    // The highlight is the passage most often quoted, and it no longer lives
    // in the body — emit it so the Markdown twin is not missing the summary.
    `**Highlight:** ${data.highlight ?? data.description}`,
    '',
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const faq = data.faq.length
    ? '\n\n---\n\n## Frequently asked questions\n\n' +
      data.faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')
    : '';

  return `${frontmatter}${stripAuthorNotes(post.body ?? '')}${faq}\n`;
}
