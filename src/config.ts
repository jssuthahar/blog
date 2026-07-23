/**
 * Single source of truth for site-wide values.
 * Anything that appears in SEO tags, JSON-LD, or llms.txt is defined here.
 */

export const SITE = {
  title: 'MSDEVBUILD',
  /** Shown beside the wordmark so the blog is always attributed. */
  byline: 'by Suthahar',
  tagline: 'Practical .NET, Azure & AI engineering',
  description:
    'In-depth, hands-on guides on .NET, C#, Azure, and AI engineering by Suthahar Jegatheesan — working code, real trade-offs, no filler.',
  url: 'https://blog.msdevbuild.com',
  locale: 'en_US',
  lang: 'en',
  postsPerPage: 12,
} as const;

/**
 * The main site. The blog lives on a subdomain, which search engines treat as
 * a partly separate property — so both properties must point at each other
 * clearly and share one author entity to keep the authority consolidated.
 */
export const MAIN_SITE = {
  url: 'https://www.msdevbuild.com',
  label: 'msdevbuild.com',
} as const;

export const AUTHOR = {
  name: 'Suthahar Jegatheesan',
  alternateName: 'MSDEVBUILD',
  /**
   * No email is published anywhere on the site — enquiries route through
   * LinkedIn or the contact form so the address is never scrapeable.
   */
  linkedin: 'https://my.linkedin.com/in/jssuthahar',
  jobTitle: 'Global Cloud, AI & Mobile Solutions Architect',
  location: 'Malaysia',
  yearsExperience: 18,
  bio: 'Global Cloud, AI & Mobile Solutions Architect with 18+ years in enterprise architecture across Microsoft Azure, .NET MAUI, and applied AI. Creator of MSDEVBUILD.',
  avatar: '/images/author.jpg',

  /**
   * `sameAs` is how search engines and LLMs resolve "Suthahar / MSDEVBUILD"
   * to one consistent entity. Every URL must be one you actually control —
   * a wrong link here splits the entity instead of merging it.
   */
  sameAs: [
    'https://www.msdevbuild.com',
    'https://suthahar.msdevbuild.com',
    'https://my.linkedin.com/in/jssuthahar',
    'https://github.com/jssuthahar',
    'https://www.youtube.com/@MSDEVBUILD',
  ],

  /** Emitted as schema.org `award`. Award reviewers and LLMs both read this. */
  awards: [
    'Microsoft Azure Content Hero',
    'C# Corner MVP',
    'Top 100 Microsoft Azure Blogs',
  ],

  /** Emitted as schema.org `hasCredential`. */
  certifications: [
    'Microsoft Certified Trainer (MCT)',
    'AZ-300 — Microsoft Azure Architect Technologies',
    'AZ-301 — Microsoft Azure Architect Design',
    'AZ-104 — Microsoft Azure Administrator',
    'AI-100 — Designing and Implementing an Azure AI Solution',
    'DP-900 — Microsoft Azure Data Fundamentals',
    'MCPD — Microsoft Certified Professional Developer',
    'SAFe® 4 Scrum Master',
  ],

  /** Emitted as schema.org `knowsAbout` — the topical authority claim. */
  expertise: [
    'Microsoft Azure',
    'Azure OpenAI',
    'Generative AI',
    '.NET MAUI',
    'Xamarin',
    'C#',
    'ASP.NET Core',
    'Microsoft Entra ID',
    'Cloud Architecture',
    'Mobile Architecture',
    'Retrieval-Augmented Generation',
    'Bot Framework',
  ],
} as const;

/**
 * Articles published each year on platforms this site cannot index — C# Corner,
 * community sites, and guest posts. Reconciles the ~236 posts in the Blogger
 * feed with the 500+ total published since 2007.
 *
 * Rendered as a separate, labelled band on the timeline rather than folded into
 * the feed counts, so the verifiable number stays visibly distinct from the
 * estimate. Set to 0 to hide the band entirely; replace with real per-year
 * figures when you have them.
 */
export const ARTICLES_ELSEWHERE_PER_YEAR = 20;

/**
 * Verified reach figures, sourced from msdevbuild.com. Shown on /about and
 * /contributions, where award reviewers and prospective employers look first.
 * Update these rather than letting them drift stale.
 */
export const IMPACT = [
  { value: '18+', label: 'Years in enterprise architecture' },
  { value: '500+', label: 'Articles published since 2007' },
  { value: '5M+', label: 'Total content views' },
  { value: '15,000+', label: 'Developers reached' },
  { value: '50+', label: 'Conference talks delivered' },
  { value: '54', label: 'Markets with shipped products' },
] as const;

export const NAV = [
  { label: 'Articles', href: '/articles' },
  { label: 'Blog', href: '/blog' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'Open source', href: '/open-source' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Speaking enquiries. `scheduler` takes a Cal.com or Calendly link if you use
 * one — both have free tiers. Left empty, every booking control falls back to
 * a pre-filled email, so the flow always works.
 */
export const BOOKING = {
  scheduler: '',
  available: true,
  /** Shown next to the availability dot in the hero. */
  availabilityNote: 'Available for conference sessions in 2026',
  responseTime: 'Usually replies within 2 days',
} as const;

/** Session topics. Drives the speaking page and the booking panel. */
export const SPEAKING_TOPICS = [
  {
    title: 'Applied AI on Azure',
    description:
      'Azure OpenAI in production: RAG pipelines, grounding, evaluation, and the retrieval work that decides whether the answers are any good.',
  },
  {
    title: 'Cloud Architecture at Scale',
    description:
      'Designing Azure platforms that survive growth — identity with Entra ID, resilience, cost, and the trade-offs behind each decision.',
  },
  {
    title: 'Cross-Platform with .NET MAUI',
    description:
      'Shipping one codebase to iOS and Android at production quality, drawn from apps running in 54 markets.',
  },
  {
    title: 'Developer Productivity with AI',
    description:
      'GitHub Copilot beyond autocomplete — agent mode, conventions, and where AI assistance genuinely changes delivery.',
  },
] as const;

/** Session formats offered to conference and community organisers. */
export const SESSION_FORMATS = [
  {
    title: 'Conference session',
    description: '30–60 minutes, demo-led, for a general developer audience.',
  },
  {
    title: 'Webinar or online session',
    description: 'Remote-friendly across time zones, in English or Tamil.',
  },
  {
    title: 'Community meetup',
    description: 'User groups and student developer communities, in person or online.',
  },
] as const;

/** Fill these in after enabling Discussions + installing the giscus app. */
export const GISCUS = {
  repo: 'jssuthahar/blog',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
} as const;

/** Newsletter form action — set once you create the Kit/MailerLite form. */
export const NEWSLETTER = {
  action: '',
  provider: 'kit',
} as const;

/**
 * Firestore project for view counts. Only the project ID is needed — the
 * counter talks to the REST API directly, so no Firebase SDK ships to the
 * browser. Empty disables the counter entirely.
 * Access is governed by firestore.rules, not by a key.
 */
export const FIREBASE = {
  projectId: '',
} as const;

/**
 * Contact form endpoint. A static site cannot process a POST, so this needs a
 * third-party form service — Formspree and Web3Forms both have free tiers.
 * Until it is set, every contact route falls back to LinkedIn.
 */
export const CONTACT_FORM = {
  action: '',
} as const;

/** GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty disables the script. */
export const GA_ID = '';
