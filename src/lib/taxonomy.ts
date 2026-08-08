/**
 * The site's single source of truth for topics and tags.
 *
 * Everything downstream derives from here — the blog category enum, the
 * category colours, the /topics hub, the footer, the editor's tag suggestions,
 * and the SEO on those pages. Change a topic once, and it updates everywhere.
 *
 * TOPICS are the broad areas a post belongs to (its `category`). TAGS are the
 * specific technologies and concepts — "use tags, not categories, for tech".
 */

export interface TopicGroup {
  /** URL/category slug — used in frontmatter and /category/<slug>. */
  slug: string;
  emoji: string;
  label: string;
  description: string;
  /** OKLCH hue angle that colour-codes the topic across the site. */
  hue: number;
  /** The technologies that live under this area, for display. */
  technologies: string[];
}

export const TOPIC_GROUPS: TopicGroup[] = [
  {
    slug: 'programming',
    emoji: '💻',
    label: 'Programming',
    description: 'Languages and the runtimes behind them — .NET, C#, and Python.',
    hue: 265,
    technologies: ['.NET', 'C#', 'Python'],
  },
  {
    slug: 'mobile',
    emoji: '📱',
    label: 'Mobile',
    description: 'Cross-platform and native apps, from .NET MAUI and Flutter to Firebase.',
    hue: 200,
    technologies: ['Flutter', 'Firebase', '.NET MAUI', 'Android', 'iOS', 'Mobile Architecture'],
  },
  {
    slug: 'web',
    emoji: '🌐',
    label: 'Web',
    description: 'The browser and the API behind it — ASP.NET Core Web APIs, REST, and React front-ends.',
    hue: 100,
    technologies: [
      'ASP.NET Core', 'Web API', 'Minimal APIs', 'REST API', 'GraphQL',
      'React', 'TypeScript', 'Blazor',
    ],
  },
  {
    slug: 'azure',
    emoji: '☁️',
    label: 'Azure',
    description: 'The Azure platform — compute, data, AI, and delivery.',
    hue: 245,
    technologies: [
      'Azure', 'Azure AI', 'Azure OpenAI', 'Azure AI Foundry', 'Azure App Services',
      'Azure Functions', 'Azure Storage', 'Azure Cosmos DB', 'Azure SQL', 'Azure DevOps',
    ],
  },
  {
    slug: 'ai',
    emoji: '🤖',
    label: 'AI',
    description: 'Applied AI — agents, RAG, and the patterns that ship.',
    hue: 165,
    technologies: [
      'AI Development', 'AI Agents', 'Agentic AI', 'Multi-Agent Systems',
      'MCP (Model Context Protocol)', 'RAG', 'LLMs', 'Prompt Engineering', 'AI Security', 'AI Architecture',
    ],
  },
  {
    slug: 'copilot',
    emoji: '🧑‍✈️',
    label: 'GitHub Copilot',
    description: 'GitHub Copilot in real delivery — agent mode, conventions, and productivity.',
    hue: 340,
    technologies: [
      'GitHub Copilot', 'Copilot Agent Mode', 'Copilot Enterprise', 'AGENT.md',
      'Copilot Extensions', 'Copilot Chat', 'Developer Productivity',
    ],
  },
  {
    slug: 'architecture',
    emoji: '🏗️',
    label: 'Architecture',
    description: 'Designing systems that survive growth — from patterns to system design.',
    hue: 300,
    technologies: [
      'Software Architecture', 'Enterprise Architecture', 'Solution Architecture', 'Clean Architecture',
      'System Design', 'Design Patterns', 'Microservices', 'Event-Driven Architecture',
    ],
  },
  {
    slug: 'devops',
    emoji: '⚙️',
    label: 'DevOps',
    description: 'CI/CD, containers, and infrastructure as code.',
    hue: 55,
    technologies: [
      'GitHub Actions', 'CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code',
      'Terraform', 'Monitoring', 'Observability',
    ],
  },
  {
    slug: 'engineering',
    emoji: '🚀',
    label: 'Engineering',
    description: 'The craft — performance, security, testing, and code quality.',
    hue: 25,
    technologies: [
      'Software Engineering', 'Best Practices', 'Performance', 'Security',
      'Testing', 'Code Quality', 'Developer Productivity',
    ],
  },
  {
    slug: 'career',
    emoji: '🎯',
    label: 'Career',
    description: 'Growth, certifications, leadership, and learning roadmaps.',
    hue: 145,
    technologies: [
      'Certifications', 'Career Growth', 'Technical Leadership',
      'Interview Preparation', 'Learning Roadmaps', 'Productivity',
    ],
  },
];

/**
 * The category slugs as a const tuple, so the content-collection schema can
 * validate against exactly these values with no drift.
 */
export const CATEGORY_SLUGS = [
  'programming', 'mobile', 'web', 'azure', 'ai', 'copilot', 'architecture', 'devops', 'engineering', 'career',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/**
 * Curated tag vocabulary — specific technologies, versions, and concepts.
 * Powers the editor's tag suggestions so tags stay consistent across posts.
 */
export const TAGS: string[] = [
  '.NET 9', '.NET 10', 'ASP.NET Core', 'Blazor', 'MAUI', 'WPF', 'WinUI', 'C# 13',
  'Python', 'Flutter', 'Dart', 'Firebase', 'Firestore',
  'GitHub Copilot', 'Copilot Enterprise', 'Azure OpenAI', 'Azure AI Foundry', 'Azure AI Search',
  'Semantic Kernel', 'Microsoft.Extensions.AI', 'OpenAI', 'GPT-5', 'MCP', 'RAG',
  'Vector Database', 'ChromaDB', 'Pinecone', 'Azure Cosmos DB', 'SQL Server', 'Azure SQL',
  'Docker', 'Kubernetes', 'GitHub Actions', 'Azure DevOps', 'Terraform',
  'Clean Architecture', 'CQRS', 'MediatR', 'DDD', 'Microservices', 'REST API', 'GraphQL',
  'OAuth', 'JWT', 'Performance', 'Security',
];

/**
 * Named technologies mapped to the URLs that identify them.
 *
 * This is the entity graph. A tag like "Azure AI Foundry" is a string to a
 * search engine until something says *which* Azure AI Foundry — the platform
 * Microsoft renamed from Azure AI Studio, not a phrase someone invented. Every
 * post emits these as schema.org `about` and `mentions` with `sameAs`, which is
 * how an answer engine resolves the term, and how a claim quoted from here gets
 * attached to the right subject.
 *
 * Only entities with a stable, official page belong here. A concept with no
 * canonical URL (Clean Architecture, CQRS) is a tag, not an entity — inventing
 * a `sameAs` for it would be worse than leaving it out.
 *
 * Keys are matched case-insensitively against a post's tags, so "GitHub Copilot
 * legacy codebase" resolves through the "github copilot" entry below.
 */
export interface TechEntity {
  /** The canonical name, which may differ from the tag someone typed. */
  name: string;
  /** Official page first, then any encyclopaedic entry. */
  sameAs: string[];
}

export const TECH_ENTITIES: Record<string, TechEntity> = {
  'github copilot': {
    name: 'GitHub Copilot',
    sameAs: ['https://github.com/features/copilot', 'https://en.wikipedia.org/wiki/GitHub_Copilot'],
  },
  'azure ai foundry': {
    // Also marketed as Microsoft Foundry after the rename; one entity either way.
    name: 'Azure AI Foundry',
    sameAs: ['https://learn.microsoft.com/en-us/azure/ai-foundry/'],
  },
  'azure openai': {
    name: 'Azure OpenAI Service',
    sameAs: ['https://learn.microsoft.com/en-us/azure/ai-services/openai/'],
  },
  azure: {
    name: 'Microsoft Azure',
    sameAs: ['https://azure.microsoft.com', 'https://en.wikipedia.org/wiki/Microsoft_Azure'],
  },
  flutter: {
    name: 'Flutter',
    sameAs: ['https://flutter.dev', 'https://en.wikipedia.org/wiki/Flutter_(software)'],
  },
  dart: { name: 'Dart', sameAs: ['https://dart.dev'] },
  firebase: {
    name: 'Firebase',
    sameAs: ['https://firebase.google.com', 'https://en.wikipedia.org/wiki/Firebase'],
  },
  firestore: { name: 'Cloud Firestore', sameAs: ['https://firebase.google.com/docs/firestore'] },
  '.net': { name: '.NET', sameAs: ['https://dotnet.microsoft.com', 'https://en.wikipedia.org/wiki/.NET'] },
  'asp.net core': { name: 'ASP.NET Core', sameAs: ['https://learn.microsoft.com/en-us/aspnet/core/'] },
  'c#': {
    name: 'C#',
    sameAs: [
      'https://learn.microsoft.com/en-us/dotnet/csharp/',
      'https://en.wikipedia.org/wiki/C_Sharp_(programming_language)',
    ],
  },
  bicep: {
    name: 'Bicep',
    sameAs: ['https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/'],
  },
  mcp: {
    name: 'Model Context Protocol',
    sameAs: ['https://modelcontextprotocol.io'],
  },
  'model context protocol': {
    name: 'Model Context Protocol',
    sameAs: ['https://modelcontextprotocol.io'],
  },
  codeql: { name: 'CodeQL', sameAs: ['https://codeql.github.com'] },
  bloc: { name: 'BLoC', sameAs: ['https://bloclibrary.dev'] },
  riverpod: { name: 'Riverpod', sameAs: ['https://riverpod.dev'] },
};

/**
 * The entities a post is about, resolved from its tags in tag order.
 *
 * Substring matching, because tags are written for humans — "GitHub Copilot
 * legacy codebase" and "Enterprise GitHub Copilot" are both the Copilot entity,
 * and demanding an exact tag would resolve almost nothing on real posts.
 */
export function entitiesForTags(tags: string[]): TechEntity[] {
  const found = new Map<string, TechEntity>();
  for (const tag of tags) {
    const t = tag.toLowerCase();
    for (const [key, entity] of Object.entries(TECH_ENTITIES)) {
      if (t === key || t.includes(key)) found.set(entity.name, entity);
    }
  }
  return [...found.values()];
}
