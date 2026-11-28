import type { APIRoute } from 'astro';
import { getPublishedPosts, getSeriesIndex, postUrl, seriesUrl, readingTime, CATEGORIES } from '../lib/posts';

/**
 * What Ask Nimbus needs beyond the search index: the newest posts, every
 * series, and a site-wide pool of quiz questions (each article's own "Test
 * yourself" questions, tagged with the article they came from). Fetched once,
 * the first time a reader opens the chat — never baked into page HTML.
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const series = await getSeriesIndex();

  const latest = posts.slice(0, 6).map((p) => ({
    title: p.data.title,
    url: postUrl(p),
    category: CATEGORIES[p.data.category].label,
    minutes: readingTime(p.body ?? ''),
  }));

  const quiz = posts.flatMap((p) =>
    p.data.quiz.map((q, i) => ({
      id: `${p.id}#${i}`,
      q: q.q,
      o: q.options,
      a: 'ABCD'.indexOf(q.answer),
      e: q.explain,
      exam: q.exam,
      from: { title: p.data.title, url: postUrl(p) },
    })),
  );

  return new Response(
    JSON.stringify({
      latest,
      series: series.map((s) => ({ title: s.title, url: seriesUrl(s.id), parts: s.parts.length })),
      quiz,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
