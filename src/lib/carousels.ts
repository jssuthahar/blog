import {
  formatDate,
  getSeriesIndex,
  postUrl,
  readingTime,
  seriesUrl,
  type SeriesSummary,
} from './posts';

export interface GlassSlide {
  tab: string;
  kicker: string;
  /** The first slide's title is the page's h1. */
  title: string;
  /** Second line of the title, in the accent colour. */
  accent?: string;
  text?: string;
  pills?: string[];
  tiles?: { value: string; label: string }[];
  /** The row of social links. */
  follow?: boolean;
  actions?: { label: string; href: string; primary?: boolean; external?: boolean }[];
  note?: string;
  panel: {
    person?: boolean;
    /** A rendered QR code's SVG. */
    qr?: string;
    title?: string;
    demo?: { kind: DemoKind; caption: string; labels?: [string, string, string] };
    steps?: { title: string; note?: string; href: string; external?: boolean }[];
    /** On a phone, keep the diagram and drop the rest of the panel. */
    demoOnlyOnPhone?: boolean;
  };
}

export type DemoKind = 'timeline' | 'social' | 'shorts' | 'flow' | 'azure' | 'copilot' | 'ai';

/** The three flagship series, shared by the home page and /series. */
const FLAGSHIPS = [
  { id: 'azure-production-issues', tab: 'Azure', kicker: 'The blog · Azure series', title: 'Azure system design,', accent: 'from real failure modes', demo: 'azure', caption: 'Each part: what broke, what fixed it, and the design that held.' },
  { id: 'agents-md-instructions', tab: 'GitHub Copilot', kicker: 'The blog · GitHub Copilot series', title: 'GitHub Copilot,', accent: 'beyond autocomplete', demo: 'copilot', caption: 'Give the agent your rules, and an issue comes back as a pull request.' },
  { id: 'azure-ai-foundry-agents', tab: 'Azure AI', kicker: 'The blog · Azure AI series', title: 'Azure AI agents,', accent: 'from zero to production', demo: 'ai', caption: 'An agent calls search and your own functions, then answers.' },
] as const;

export function seriesMinutes(series: SeriesSummary): number {
  return series.parts.reduce((sum, p) => sum + readingTime(p.body ?? ''), 0);
}

/** A series with nothing published yet drops out rather than showing an empty slide. */
export async function flagshipSeriesSlides(): Promise<GlassSlide[]> {
  const index = await getSeriesIndex();
  return FLAGSHIPS.flatMap((flagship): GlassSlide[] => {
    const series = index.find((s) => s.id === flagship.id);
    if (!series) return [];
    return [{
      tab: flagship.tab,
      kicker: flagship.kicker,
      title: flagship.title,
      accent: flagship.accent,
      text: series.description,
      tiles: [
        { value: String(series.parts.length), label: series.parts.length === 1 ? 'part' : 'parts' },
        { value: `${seriesMinutes(series)} min`, label: 'of reading' },
        { value: formatDate(series.latest.data.publishedAt), label: 'latest part' },
      ],
      actions: [
        { label: 'See the series →', href: seriesUrl(series.id), primary: true },
        { label: 'Start at part 1', href: postUrl(series.parts[0]!) },
      ],
      panel: {
        demo: { kind: flagship.demo, caption: flagship.caption },
        title: 'Start here',
        steps: series.parts.slice(0, 3).map((p) => ({ title: p.data.title, href: postUrl(p) })),
      },
    }];
  });
}
