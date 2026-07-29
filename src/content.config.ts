import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from './lib/taxonomy';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    /**
     * Derive the id (and therefore the /blog/<id> URL) from the filename ONLY,
     * ignoring any folders. This lets us group articles into per-series
     * subfolders for manageability without changing a single URL — a file can
     * move between folders and keep its slug. The one rule: filename stems must
     * stay unique across the whole collection, since the stem IS the URL.
     */
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.(md|mdx)$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      /**
       * Card copy, article lede, and the meta description. The real limit is
       * 1000px rendered (Arial 14px) — `npm run check:seo` measures it. This
       * character cap is only a coarse build-time backstop: 200 chars was wide
       * enough to ship descriptions Google truncated, 170 is not.
       */
      description: z.string().min(50).max(170),
      publishedAt: z.coerce.date(),
      /** Surfaced in the UI and in JSON-LD — freshness is a strong ranking signal. */
      updatedAt: z.coerce.date().optional(),

      /** Primary category — drives the accent colour and the main topic page. */
      category: z.enum(CATEGORY_SLUGS),
      /** Additional categories this post is cross-listed under. */
      categories: z.array(z.enum(CATEGORY_SLUGS)).default([]),
      tags: z.array(z.string()).default([]),

      cover: image().optional(),
      coverAlt: z.string().optional(),

      /** Multi-part guides: same `series` slug, incrementing `seriesOrder`. */
      series: z.string().optional(),
      seriesOrder: z.number().int().positive().optional(),

      /**
       * The one-paragraph takeaway shown in a highlight box at the top of the
       * post. Falls back to `description` when omitted, so every post always
       * opens with a summary — this is also the passage most often quoted by
       * search engines and AI answer engines.
       */
      highlight: z.string().max(400).optional(),

      draft: z.boolean().default(false),
      featured: z.boolean().default(false),

      /** The original Blogger path(s), e.g. "/2023/05/minimal-api.html".
       *  Each one gets a static redirect stub at build time. */
      redirectFrom: z.array(z.string()).default([]),

      /** SEO / AEO overrides. */
      seoTitle: z.string().max(70).optional(),
      canonical: z.string().url().optional(),
      /** Rendered on the page AND emitted as FAQPage schema. */
      faq: z
        .array(z.object({ q: z.string(), a: z.string() }))
        .default([]),
    })
    .refine((d) => !d.cover || d.coverAlt, {
      message: 'coverAlt is required when a cover image is set (accessibility + SEO)',
      path: ['coverAlt'],
    })
    .refine((d) => !d.series || d.seriesOrder !== undefined, {
      message: 'seriesOrder is required when series is set',
      path: ['seriesOrder'],
    }),
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().int().default(0),
  }),
});

/**
 * Community contributions — talks, videos, courses, OSS, and writing published
 * elsewhere.
 *
 * This exists because MVP and GDE nominations are assessed on a dated,
 * linkable record of public contribution, weighted heavily toward the last
 * 12 months. Keeping it as data (rather than prose on a page) means the
 * evidence list stays sortable, countable, and exportable at nomination time.
 */
const contributions = defineCollection({
  loader: glob({ base: './src/content/contributions', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['talk', 'video', 'article', 'oss', 'course', 'community', 'book']),
    date: z.coerce.date(),
    /** Conference, publication, channel, or organisation. */
    venue: z.string().optional(),
    location: z.string().optional(),
    url: z.string().url().optional(),
    /** Which award programme this evidences. */
    ecosystem: z.enum(['microsoft', 'google', 'other']).default('microsoft'),
    technologies: z.array(z.string()).default([]),
    /** Audience size, views, or attendees — reviewers look for reach. */
    reach: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

/**
 * Speaking engagements. Past and upcoming live in one collection — "upcoming"
 * is derived from the date at build time, so an event moves to the past
 * automatically instead of needing a status field kept in sync by hand.
 */
const speaking = defineCollection({
  loader: glob({ base: './src/content/speaking', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /** The talk being given, when it differs from the event name. */
    talk: z.string().optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    format: z.enum(['conference', 'webinar', 'session', 'meetup', 'podcast', 'community']),
    venue: z.string().optional(),
    location: z.string().default('Online'),
    online: z.boolean().default(false),
    url: z.string().url().optional(),
    registrationUrl: z.string().url().optional(),
    topics: z.array(z.string()).default([]),
    audience: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

/**
 * Hosted events people can register for — workshops, webinars, launches, and
 * community meetups. Distinct from `speaking` (talks Suthahar gives at other
 * people's events): these are organised here, have a detail page, and take
 * sign-ups. Like `speaking`, "upcoming" vs "past" is derived from the date at
 * build time. The Markdown body holds the full agenda/description.
 */
const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().max(120),
        /** Card + meta description. */
        description: z.string().min(20).max(300),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        /** Shown next to the time so attendees know the zone. */
        timezone: z.string().default('IST'),
        format: z.enum(['workshop', 'webinar', 'meetup', 'conference', 'launch', 'community']),
        venue: z.string().optional(),
        location: z.string().default('Online'),
        online: z.boolean().default(false),
        /** Meeting link for online events, revealed on the detail page. */
        joinUrl: z.string().url().optional(),

        cover: image().optional(),
        coverAlt: z.string().optional(),

        host: z.string().optional(),
        /** Free-text so "Free", "₹499", or "$29" all work. */
        price: z.string().default('Free'),
        /** Soft cap — drives the "N seats" line and best-effort full state. */
        capacity: z.number().int().positive().optional(),
        /** Per-event override of EVENTS.registrationSeed (display-only baseline). */
        registrationSeed: z.number().int().min(0).optional(),
        topics: z.array(z.string()).default([]),

        /**
         * open     — take sign-ups here (Firestore).
         * external — send people to `registrationUrl`.
         * closed   — show details, no registration.
         */
        registration: z.enum(['open', 'external', 'closed']).default('open'),
        registrationUrl: z.string().url().optional(),

        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .refine((d) => !d.cover || d.coverAlt, {
        message: 'coverAlt is required when a cover image is set (accessibility + SEO)',
        path: ['coverAlt'],
      })
      .refine((d) => d.registration !== 'external' || d.registrationUrl, {
        message: 'registrationUrl is required when registration is "external"',
        path: ['registrationUrl'],
      }),
});

export const collections = { blog, series, contributions, speaking, events };
