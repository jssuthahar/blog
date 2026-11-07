import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPosts, type Post } from '../../lib/posts';
import { postMarkdown } from '../../lib/post-markdown';

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

export const GET: APIRoute = ({ props }) =>
  new Response(postMarkdown(props.post as Post), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
