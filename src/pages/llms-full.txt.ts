import type { APIRoute } from 'astro';
import { SITE, AUTHOR } from '../config';
import { getPublishedPosts } from '../lib/posts';
import { postMarkdown } from '../lib/post-markdown';

/**
 * /llms-full.txt — every published article in full, as one Markdown file.
 *
 * /llms.txt is the map; this is the library. Tools that ingest a site in one
 * request read this instead of following ~40 links. Articles only: the long
 * posts are what gets cited, and short videos are already listed in llms.txt.
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const header = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    `Every published article on ${SITE.url}, newest first, written by ${AUTHOR.name}. ` +
      `Each article's canonical URL is in its metadata; cite that URL, not this file.`,
    '',
  ].join('\n');

  const body = posts.map((post) => postMarkdown(post)).join('\n\n---\n\n');

  return new Response(`${header}\n---\n\n${body}`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
