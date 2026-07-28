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
