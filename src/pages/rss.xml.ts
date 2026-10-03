import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { CATEGORIES, getPublishedPosts, postUrl } from '../lib/posts';
import { getShorts, shortUrl } from '../lib/shorts';

/**
 * The feed is also the newsletter pipeline: Kit/MailerLite RSS automation
 * reads this and mails subscribers when a new item appears. Keep the
 * descriptions good — they become the email preview text.
 */
export const GET: APIRoute = async (context) => {
  // Posts and short videos share one feed, newest first. The feed's contract
  // is that item one is the latest thing published, and a reader or a
  // newsletter automation that trusts document order must never get otherwise.
  // Undated shorts are left out: an item without a pubDate cannot be placed.
  const postItems = (await getPublishedPosts()).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.publishedAt,
    link: postUrl(post),
    categories: [CATEGORIES[post.data.category].label, ...post.data.tags],
  }));

  const shortItems = getShorts()
    .filter((short) => short.publishedAt)
    .map((short) => ({
      title: `Short video: ${short.title}`,
      description: short.description,
      pubDate: short.publishedAt!,
      link: shortUrl(short),
      categories: [CATEGORIES[short.category].label, 'Short video', ...short.tags],
    }));

  const items = [...postItems, ...shortItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  const latest = items[0]?.pubDate ?? new Date();

  return rss({
    title: `${SITE.title} — ${SITE.tagline}`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    // RSS 2.0 <author> is defined as an email address, so it is omitted
    // rather than publishing one. Attribution is carried by the feed title.
    items,
    // lastBuildDate is the newest item's date, not the build time: a rebuild
    // that changed nothing should not tell every reader the feed is new.
    customData: `<language>${SITE.lang}</language><lastBuildDate>${latest.toUTCString()}</lastBuildDate>`,
  });
};
