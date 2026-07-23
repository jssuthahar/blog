import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      /** Shown on cards and used as the meta description fallback. Keep it under 200 chars. */
      description: z.string().min(50).max(200),
      publishedAt: z.coerce.date(),
      /** Surfaced in the UI and in JSON-LD — freshness is a strong ranking signal. */
      updatedAt: z.coerce.date().optional(),

      category: z.enum(['dotnet', 'csharp', 'azure', 'ai', 'devops', 'career']),
      tags: z.array(z.string()).default([]),

      cover: image().optional(),
      coverAlt: z.string().optional(),

      /** Multi-part guides: same `series` slug, incrementing `seriesOrder`. */
      series: z.string().optional(),
      seriesOrder: z.number().int().positive().optional(),

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
const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
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

export const collections = { blog, series, contributions, events };
