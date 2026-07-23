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
  const posts = await getPublishedPosts();

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
    customData: `<language>${SITE.lang}</language>`,
  });
};
