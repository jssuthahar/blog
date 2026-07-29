/**
 * Single source of truth for site-wide values.
 * Anything that appears in SEO tags, JSON-LD, or llms.txt is defined here.
 */

export const SITE = {
  title: 'MSDEVBUILD',
  /** Expands the wordmark: MSDEVBUILD = Multi-Stack Dev Build. */
  alternateName: 'Multi-Stack Dev Build',
  /** Shown beside the wordmark so the blog is always attributed. */
  byline: 'by Suthahar',
  /** Also used as the home-page <title> suffix, so it must read as a positioning line. */
  tagline: 'Cloud, AI, Mobile & Web developer platform',
  /** Kept under ~155 chars so Google renders it without truncating (~1000px). */
  description:
    'Multi-stack developer learning platform by Suthahar — hands-on Cloud, Azure, AI, GitHub Copilot, Flutter, .NET MAUI and Web. Real code, real trade-offs.',
  /**
   * The technology pillars the platform covers. Emitted as schema.org `about`
   * + `keywords` on the WebSite entity and listed in llms.txt, so search
   * engines and LLMs read MSDEVBUILD as multi-stack rather than .NET-only.
   * Order signals emphasis: Cloud/AI lead because that is the current focus.
   */
  topics: [
    'Cloud & Azure architecture',
    'Azure AI, Generative AI & AI engineering',
    'GitHub Copilot, AI agents & AI-powered development',
    'Vibe coding & developer productivity',
    'Mobile development — Flutter & .NET MAUI',
    'Web development — Web API & React',
    'Legacy application AI integration & modernization',
    'Programming & software engineering fundamentals',
    'Firebase, analytics & modern application platforms',
  ],
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
  jobTitle: 'Cloud, AI & Mobile Solutions Architect',
  location: 'Malaysia',
  yearsExperience: 18,
  bio: 'Cloud, AI & Mobile Solutions Architect with 18+ years in enterprise architecture across Azure, Google Cloud and Firebase, building with C#, Python, .NET MAUI and Flutter, and applying AI with Azure AI, Claude and GitHub Copilot. Creator of MSDEVBUILD.',
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

  /**
   * Grouped for display on /about. Order matters: AI leads because it is the
   * most current work, and the cloud group deliberately spans all three
   * providers rather than reading as Microsoft-only.
   */
  skillGroups: [
    {
      title: 'AI & developer tooling',
      skills: ['Artificial Intelligence', 'GitHub Copilot', 'Azure AI', 'Claude', 'Generative AI'],
    },
    {
      title: 'Cloud platforms',
      skills: ['Azure Cloud', 'Google Cloud', 'Firebase'],
    },
    {
      title: 'Languages & frameworks',
      skills: ['C#', 'Python', '.NET MAUI', 'Flutter'],
    },
    {
      title: 'Platforms & delivery',
      skills: ['Web Development', 'Mobile Development', 'API Development', 'DevOps'],
    },
  ],
} as const;

/**
 * Verifiable Microsoft achievements, each linking to its Microsoft Learn
 * achievement page so the credential is provable rather than just claimed.
 * Rendered as visual badges on the home and about pages and folded into the
 * about page's schema.org `award` list. `tier` drives the medallion colour;
 * `icon` selects the glyph in MicrosoftBadges.astro.
 */
export const MICROSOFT_ACHIEVEMENTS = [
  {
    name: 'Certified Microsoft Innovative Educator',
    short: 'Microsoft Innovative Educator',
    tier: 'Certified',
    icon: 'educator',
    url: 'https://learn.microsoft.com/en-us/users/jssuthahar/achievements/7v6ey2ez',
  },
  {
    name: 'Silver MSDN and TechNet Galleries contributor',
    short: 'MSDN & TechNet Galleries',
    tier: 'Silver',
    icon: 'gallery',
    url: 'https://learn.microsoft.com/en-us/users/jssuthahar/achievements/4syhar5k',
  },
  {
    name: 'Silver TechNet Wiki contributor',
    short: 'TechNet Wiki',
    tier: 'Silver',
    icon: 'wiki',
    url: 'https://learn.microsoft.com/en-us/users/jssuthahar/achievements/x2gdc6my',
  },
  {
    name: 'Bronze MSDN and TechNet Blogs contributor',
    short: 'MSDN & TechNet Blogs',
    tier: 'Bronze',
    icon: 'blog',
    url: 'https://learn.microsoft.com/en-us/users/jssuthahar/achievements/hyjestz8',
  },
] as const;

/**
 * Flat skill list emitted as schema.org `knowsAbout` — the topical authority
 * claim search engines and LLMs read. Derived from the groups so the page and
 * the structured data can never disagree.
 */
export const EXPERTISE: readonly string[] = AUTHOR.skillGroups.flatMap((g) => g.skills);

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
] as const;

/**
 * Follow targets. Each carries its own verb — "subscribe" on YouTube, "follow"
 * elsewhere — because the ask should match what the platform actually calls it.
 */
export const SOCIAL = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/jssuthahar',
    action: 'Follow',
    href: 'https://my.linkedin.com/in/jssuthahar',
    blurb: 'Architecture notes and career posts',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@jssuthahar',
    action: 'Follow',
    href: 'https://github.com/jssuthahar',
    blurb: 'Sample code and open-source projects',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@MSDEVBUILD',
    action: 'Subscribe',
    href: 'https://www.youtube.com/@MSDEVBUILD?sub_confirmation=1',
    blurb: 'Video walkthroughs in English and Tamil',
  },
] as const;

export const NAV = [
  { label: 'Home', href: '/' },
  // Blog and Series sit ahead of the syndicated article library: the posts
  // written here are the point of the site, and a series is the way most
  // readers want to read them.
  { label: 'Blog', href: '/blog/' },
  { label: 'Series', href: '/series/' },
  { label: 'Articles', href: '/articles/' },
  { label: 'Events', href: '/events/' },
  { label: 'Speaking', href: '/speaking/' },
  { label: 'Open source', href: '/open-source/' },
  { label: 'About', href: '/about/' },
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
      'Shipping one codebase to iOS and Android at production quality, from real delivery experience.',
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
  repoId: 'R_kgDOThK5Yw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOThK5Y84DB1hU',
} as const;

/** Newsletter form action — set once you create the Kit/MailerLite form. */
export const NEWSLETTER = {
  action: '',
  provider: 'kit',
} as const;

/**
 * Web Push (PWA notifications). Standard VAPID push — no Firebase SDK ships to
 * the browser; the service worker (`public/sw.js`) receives the push directly.
 *
 * `publicKey` is the VAPID *public* key and is safe to publish — it is what the
 * browser encrypts its subscription to. The matching *private* key lives only
 * in `.env` (VAPID_PRIVATE_KEY) and is used by `scripts/send-push.mjs` to sign
 * sends; it must never be committed. Regenerate both with `npm run push:keys`.
 *
 * Subscriptions are stored in Firestore (`pushSubscriptions`), so this reuses
 * the same free-tier Firestore already powering views and subscribers — no
 * Cloud Functions, no billing. Blank `publicKey` disables the notify UI.
 */
export const PUSH = {
  publicKey: 'BJdVP1Fm0wckAPotGdybEqQnxcrv9zWITDdq0PPU3MbtgvHxSMwWByudsKmQGr8eyG307zLamI0bu-8ZMLk6erI',
  /** Shown in the browser's permission prompt context and the notify button. */
  label: 'New articles & announcements',
} as const;

/**
 * Firestore project for view counts, subscribers, and testimonials. Everything
 * talks to the REST API directly, so no Firebase SDK ships to the browser.
 * Empty projectId disables those features.
 *
 * No API key: the Firestore REST endpoint accepts unauthenticated requests and
 * firestore.rules decides what they may do. Shipping a key added nothing except
 * a Google-shaped credential in a public repo for scanners to flag.
 */
export const FIREBASE = {
  projectId: 'msdevbuild-blog',
  /**
   * Needed only by /admin — Firebase Authentication requires it, while the
   * Firestore REST calls on public pages do not. It is a public identifier by
   * design (Google documents it as safe in client code) but GitHub's scanner
   * flags the `AIza` prefix regardless, so restrict it by HTTP referrer to
   * blog.msdevbuild.com in Google Cloud Console → Credentials.
   */
  apiKey: 'AIzaSyC1oOQOPnd4i-6W0vXkhDHrzRAFYpd0nDk',
} as const;

/**
 * Admin console access. `uid` is the Firebase Auth UID allowed to moderate —
 * paste it from Authentication → Users after creating the account, and put the
 * same value in firestore.rules. The rules are the real gate; this constant
 * only decides what the UI offers.
 */
export const ADMIN = {
  uid: 'BVDLfgqNvJSZORv2zRitolBU3Cn2',
} as const;

/**
 * Event registration display.
 *
 * `registrationSeed` is a baseline added to the live sign-up count so a brand
 * new event does not read as "0 registered". It is social proof, not a real
 * attendee list — the true count still drives your CSV export in /admin, and
 * this number is display-only. Set it to 0 to show only real registrations, or
 * override it per event with `registrationSeed` in the event's frontmatter.
 */
export const EVENTS = {
  registrationSeed: 17,
} as const;


/**
 * Contact form endpoint. A static site cannot process a POST, so this needs a
 * third-party form service — Formspree and Web3Forms both have free tiers.
 * Until it is set, every contact route falls back to LinkedIn.
 */
export const CONTACT_FORM = {
  action: '',
} as const;

/**
 * GA4 measurement ID — the `measurementId` from the Firebase web config.
 * Firebase's getAnalytics() is a wrapper around GA4, so loading gtag directly
 * reports identical data without shipping the Firebase SDK to every visitor.
 */
export const GA_ID = 'G-X0V2Y2GH4D';

// Google AdSense publisher ID. Approval is account-level and already covers
// this subdomain; ownership is verified via /ads.txt in public/.
export const ADSENSE_CLIENT = 'ca-pub-3425499927549926';

// Ad-unit slot IDs. Create each unit in AdSense → Ads → By ad unit, then paste
// its numeric slot here. Blank = that AdUnit renders nothing, so no empty boxes
// ship before the unit exists.
//   IN_ARTICLE — an "In-article" fluid unit, used at the end of reading pages.
//   DISPLAY    — a responsive "Display" unit, used on listing pages.
//   MULTIPLEX  — an "autorelaxed" grid of recommendations, used once at the very
//                bottom of a post so it never competes with the article itself.
//   IN_FEED    — an "In-feed" native unit for the app feed (/app), the only unit
//                type Google designs to sit *between* list items.
export const ADSENSE_SLOT_IN_ARTICLE = '1663662929';
export const ADSENSE_SLOT_DISPLAY = '6724417913';
export const ADSENSE_SLOT_MULTIPLEX = '4098254574';

/**
 * In-feed unit for the app feed. Create it in AdSense → Ads → By ad unit →
 * In-feed, style it, then paste both values Google gives you: the numeric slot
 * and the `data-ad-layout-key` (looks like `-fb+5w+4e-db+86`).
 *
 * Until both are filled the feed falls back to the responsive DISPLAY unit,
 * which is a valid placement — just not the native one.
 */
export const ADSENSE_SLOT_IN_FEED = '';
export const ADSENSE_LAYOUT_KEY_IN_FEED = '';
