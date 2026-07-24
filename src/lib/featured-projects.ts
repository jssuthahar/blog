/**
 * Hand-picked flagship projects for the top of the open-source page.
 *
 * The rest of that page is generated automatically from GitHub (see
 * `lib/repos.ts`); this list is curated because these projects have a live
 * demo, a real-world use case, and a short story worth telling — things the
 * raw repo metadata cannot capture. Order here is the order shown.
 */
export interface FeaturedProject {
  /** Display name. */
  name: string;
  /** Optional trailing emoji/flag, kept out of `name` so it never leaks into schema. */
  emoji?: string;
  /** One-line positioning statement. */
  tagline: string;
  /** A sentence or two of context. */
  summary: string;
  /** Short capability bullets — kept to a handful so the card stays dense. */
  features: string[];
  /** Tech shown as chips. */
  tech: string[];
  /** Public, hosted demo. Present ⇒ the card shows the primary "Live demo" action. */
  live?: string;
  /** Source repository. */
  source: string;
  /** Two-stop gradient `[from, to]` for the card banner — a distinct look per project. */
  gradient: [string, string];
  /** Short monogram shown large in the banner when there is no emoji. */
  monogram: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    name: 'JSON Studio',
    tagline: 'Free, client-side JSON tooling',
    summary:
      '14+ JSON productivity tools for developers, testers, and architects. No account, no backend — your data never leaves the browser, with a ⌘K launcher to jump straight to any tool.',
    features: [
      '14+ tools in one workspace',
      'Fully client-side — data stays local',
      'Searchable ⌘K / Ctrl+K launcher',
      'No account, no backend',
    ],
    tech: ['Web', 'Static app'],
    live: 'https://jsonstudio.msdevbuild.com/',
    source: 'https://github.com/jssuthahar/JSON-Studio',
    gradient: ['#2563eb', '#4f46e5'],
    monogram: 'JS',
  },
  {
    name: 'NikiBhavi',
    emoji: '🇲🇾',
    tagline: 'Malaysia life guide — built by Indians living in Malaysia',
    summary:
      'Honest, experience-based guidance for people living in Malaysia — no paid promotions, no misleading advice. Built from real day-to-day experience to help the community.',
    features: [
      'Employee Pass, tourist visa & tax',
      'EPF, salary & remittance',
      'Housing & cost of living',
      'Everyday life guidance',
    ],
    tech: ['Flutter', 'Firebase'],
    live: 'https://nikibhavi.msdevbuild.com/#/home',
    source: 'https://github.com/jssuthahar/Malaysia-Life-Guide',
    gradient: ['#0d9488', '#16a34a'],
    monogram: 'NB',
  },
  {
    name: 'SpinWheel',
    emoji: '🎡',
    tagline: 'Gamification & engagement platform',
    summary:
      'Not just a random picker — a customizable engagement platform for events and organizations, with QR-based hidden experiences, branding, and a presentation mode for screens and projectors.',
    features: [
      'Reward-based gamification',
      'QR-based hidden experiences',
      'Company branding',
      'Presentation mode for projectors',
    ],
    tech: ['Web'],
    live: 'https://spinwheel.msdevbuild.com/',
    source: 'https://github.com/jssuthahar/spinwheel',
    gradient: ['#7c3aed', '#db2777'],
    monogram: 'SW',
  },
  {
    name: 'Malaysia Living Cost & Savings Calculator',
    emoji: '🇲🇾',
    tagline: 'Plan monthly expenses and savings',
    summary:
      'Helps people living in Malaysia understand monthly expenses, plan savings, and manage financial decisions — with lifestyle-based adjustments and spending visualization.',
    features: [
      'Single, married & family modes',
      'Lifestyle-based adjustments',
      'Monthly savings estimation',
      'Spending visualization & export',
    ],
    tech: ['Flutter Web'],
    live: 'https://malaysialivingcost.msdevbuild.com/',
    source: 'https://github.com/jssuthahar/malaysialivingcost',
    gradient: ['#ea580c', '#d97706'],
    monogram: 'LC',
  },
  {
    name: 'Malaysia Tax Calculator',
    emoji: '🇲🇾',
    tagline: 'Fast, accurate income-tax estimator',
    summary:
      'Helps Malaysian residents and foreign professionals estimate income tax — resident progressive and non-resident flat rules, monthly and yearly, with net-salary calculation.',
    features: [
      'Resident progressive rates',
      'Non-resident flat rules',
      'Monthly & yearly estimation',
      'Net salary calculation',
    ],
    tech: ['Flutter Web'],
    live: 'https://jssuthahar.github.io/malaysiatax/',
    source: 'https://github.com/jssuthahar/malaysiatax',
    gradient: ['#059669', '#0891b2'],
    monogram: 'TX',
  },
  {
    name: 'Video Downloader',
    tagline: 'Web-based video downloader',
    summary:
      'A simple, open-source web video downloader built for learning and experimentation.',
    features: ['Web-based UI', 'Built for learning'],
    tech: ['Web'],
    live: 'https://jssuthahar.github.io/video-downloader/',
    source: 'https://github.com/jssuthahar/video-downloader',
    gradient: ['#0ea5e9', '#4f46e5'],
    monogram: 'VD',
  },
];
