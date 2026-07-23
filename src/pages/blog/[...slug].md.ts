import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE, AUTHOR } from '../../config';
import { CATEGORIES, getPublishedPosts, postUrl, type Post } from '../../lib/posts';

/**
 * Markdown twin of every post.
 *
 * AI crawlers parse Markdown far more reliably than HTML wrapped in navigation
 * and styling. Each HTML page links here via <link rel="alternate"
 * type="text/markdown">, so an assistant that finds the article can fetch a
 * clean copy with no chrome to strip.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => {
  const post = props.post as Post;
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
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const faq = data.faq.length
    ? '\n\n---\n\n## Frequently asked questions\n\n' +
      data.faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')
    : '';

  const body = `${frontmatter}${post.body ?? ''}${faq}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
