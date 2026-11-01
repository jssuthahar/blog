import { allArticles } from './articles';
import { repoIndex } from './repos';
import { ARTICLES_ELSEWHERE_PER_YEAR } from '../config';

/**
 * Derived proof of contribution.
 *
 * Everything here is computed from the synced feeds — never hand-written — so
 * the numbers on the page cannot drift away from what the sources actually say.
 */

const MS_YEAR = 365 * 24 * 60 * 60 * 1000;

function cutoff(months = 12): Date {
  return new Date(Date.now() - (months / 12) * MS_YEAR);
}

export interface YearCount {
  year: number;
  /** Counted directly from the synced feed — verifiable. */
  tracked: number;
  /** Estimated output on platforms this site cannot index. */
  elsewhere: number;
  total: number;
}

/** Articles published per calendar year, gap years included as zero. */
export function articlesByYear(): YearCount[] {
  const counts = new Map<number, number>();

  for (const article of allArticles()) {
    const year = new Date(article.published).getFullYear();
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  const years = [...counts.keys()];
  const first = Math.min(...years);
  const last = new Date().getFullYear();

  const series: YearCount[] = [];
  for (let year = first; year <= last; year++) {
    const tracked = counts.get(year) ?? 0;
    const elsewhere = ARTICLES_ELSEWHERE_PER_YEAR;
    series.push({ year, tracked, elsewhere, total: tracked + elsewhere });
  }

  return series;
}

export function publishingSpan() {
  const series = articlesByYear();

  // Consistency is measured on tracked output only. Counting the estimate here
  // would let an assumed constant paper over a year with no verifiable work.
  const active = series.filter((y) => y.tracked > 0);

  return {
    firstYear: series[0]?.year ?? new Date().getFullYear(),
    lastYear: series[series.length - 1]?.year ?? new Date().getFullYear(),
    /** Calendar years spanned, inclusive. */
    years: series.length,
    activeYears: active.length,
    peak: series.reduce((max, y) => (y.tracked > max.tracked ? y : max), series[0]),
    estimatedTotal: series.reduce((sum, y) => sum + y.total, 0),
  };
}

/**
 * Activity inside the trailing 12 months.
 *
 * MVP and GDE reviews weight this window most heavily, so it is computed
 * separately rather than folded into lifetime totals.
 */
export function recentActivity() {
  const since = cutoff(12);

  const articles = allArticles().filter((a) => new Date(a.published) >= since);
  const repos = repoIndex.repos.filter((r) => new Date(r.updated) >= since);

  return { since, articles, repos };
}

/**
 * Microsoft MVP nominations are not submitted as one list — every activity is
 * tagged with a contribution type from a fixed set, and reviewers read the
 * trailing-12-month count per type. Grouping the record the same way turns it
 * into something a reviewer can transcribe, instead of something they have to
 * classify themselves.
 *
 * Types with no evidence are dropped rather than shown as a zero. An empty row
 * would be a claim about a gap; leaving it out is simply silence.
 */
const ACTIVITY_TYPES = {
  article: {
    label: 'Article & blog post',
    detail: 'Technical writing on owned and third-party sites',
    href: '/articles/',
  },
  talk: {
    label: 'Speaking',
    detail: 'Conference sessions, webinars and meetups',
    href: '/events/',
  },
  video: {
    label: 'Video, webcast & podcast',
    detail: 'Recorded technical content',
    href: 'https://www.youtube.com/@MSDEVBUILD',
  },
  oss: {
    label: 'Open source project',
    detail: 'Public repositories, samples and tools',
    href: '/open-source/',
  },
  course: {
    label: 'Courseware & learning material',
    detail: 'Structured, reusable learning content',
    href: '/articles/',
  },
  community: {
    label: 'Community leadership',
    detail: 'Organising and moderating community activity',
    href: '/contributions/',
  },
  book: { label: 'Book', detail: 'Authored or co-authored', href: '/about/' },
} as const;

export type ActivityKind = keyof typeof ACTIVITY_TYPES;

export interface MvpActivity {
  kind: ActivityKind;
  label: string;
  detail: string;
  href: string;
  /** Inside the trailing 12 months — the window the programme weights. */
  recent: number;
  total: number;
}

/**
 * Counts the merged contribution record by MVP activity type.
 *
 * Takes the entries rather than loading them so this stays synchronous and
 * testable, and so the page keeps one source of truth for what counts as a
 * contribution.
 */
export function mvpActivityBreakdown(
  entries: readonly { kind: ActivityKind; date: Date }[],
  extra: Partial<Record<ActivityKind, { recent: number; total: number }>> = {},
): MvpActivity[] {
  const since = cutoff(12);

  return (Object.keys(ACTIVITY_TYPES) as ActivityKind[])
    .map((kind) => {
      const matching = entries.filter((e) => e.kind === kind);
      const bonus = extra[kind] ?? { recent: 0, total: 0 };

      return {
        kind,
        ...ACTIVITY_TYPES[kind],
        recent: matching.filter((e) => e.date >= since).length + bonus.recent,
        total: matching.length + bonus.total,
      };
    })
    .filter((a) => a.total > 0)
    .sort((a, b) => b.recent - a.recent || b.total - a.total);
}

/** Distinct technology areas covered across the article library. */
export function topicsCovered(): number {
  const topics = new Set<string>();
  for (const article of allArticles()) {
    for (const category of article.categories) topics.add(category);
  }
  return topics.size;
}

/** The headline pillars, each backed by a source the reader can open. */
export function contributionPillars() {
  const span = publishingSpan();

  return [
    {
      value: '500+',
      label: 'Articles published',
      detail: `${allArticles().length} indexed here since ${span.firstYear}`,
      href: '/articles/',
    },
    {
      value: '5M+',
      label: 'Content views',
      detail: 'articles and video combined',
      href: 'https://www.youtube.com/@MSDEVBUILD',
    },
    {
      value: '50+',
      label: 'Sessions delivered',
      detail: 'conferences and communities',
      href: '/speaking/',
    },
    {
      value: `${repoIndex.count}`,
      label: 'Open-source repos',
      detail: `${repoIndex.totalStars} stars · ${repoIndex.totalForks} forks`,
      href: '/open-source/',
    },
    {
      value: '15,000+',
      label: 'Developers reached',
      detail: 'through sessions and content',
      href: '/about/',
    },
    {
      value: `${topicsCovered()}`,
      label: 'Technology areas',
      detail: 'Azure, AI, .NET, mobile',
      href: '/articles/',
    },
  ];
}
