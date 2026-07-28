import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { CATEGORIES, getPublishedPosts, postUrl } from '../lib/posts';

/**
 * The feed is also the newsletter pipeline: Kit/MailerLite RSS automation
 * reads this and mails subscribers when a new item appears. Keep the
 * descriptions good — they become the email preview text.
 */
export const GET: APIRoute = async (context) => {
  // getPublishedPosts is already newest-first; sorted again here because the
  // feed's contract is that item one is the latest post, and a reader or a
  // newsletter automation that trusts document order must never get otherwise.
  const posts = (await getPublishedPosts()).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  const latest = posts[0]?.data.publishedAt ?? new Date();

  return rss({
    title: `${SITE.title} — ${SITE.tagline}`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postUrl(post),
      // RSS 2.0 <author> is defined as an email address, so it is omitted
      // rather than publishing one. Attribution is carried by the feed title.
      categories: [CATEGORIES[post.data.category].label, ...post.data.tags],
    })),
    // lastBuildDate is the newest post's date, not the build time: a rebuild
    // that changed nothing should not tell every reader the feed is new.
    customData: `<language>${SITE.lang}</language><lastBuildDate>${latest.toUTCString()}</lastBuildDate>`,
  });
};
