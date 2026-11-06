/**
 * Search terms the site is built around, kept in one place.
 *
 * `TOPIC_LINKS` is deliberately limited to terms with a published page behind
 * them: each one is a visible link, which is what ranks. A term with nothing
 * behind it earns nothing and reads as stuffing to search and answer engines, so
 * it goes in the article backlog instead and moves here once the article ships.
 */

/** The names people search for the author and the site. */
export const BRAND_KEYWORDS = [
  'Suthahar',
  'Suthahar Jegatheesan',
  'MSDEVBUILD',
  'MSDEVBUILD Blog',
  'C# Corner MVP',
];

export const TOPIC_LINKS: { term: string; href: string }[] = [
  { term: 'Azure', href: '/category/azure/' },
  { term: 'Azure AI', href: '/category/ai/' },
  { term: 'Microsoft Foundry', href: '/blog/what-is-azure-ai-foundry-services-overview/' },
  { term: 'Foundry Agent Service', href: '/series/azure-ai-foundry-agents/' },
  { term: 'Foundry Models', href: '/blog/azure-ai-foundry-choose-right-model/' },
  { term: 'Azure OpenAI', href: '/blog/azure-openai-rag-dotnet/' },
  { term: 'RAG', href: '/blog/azure-openai-rag-dotnet/' },
  { term: 'AI Agents', href: '/blog/azure-ai-foundry-ai-agent-food-delivery-app/' },
  { term: 'Multi-Agent Orchestration', href: '/blog/github-copilot-multi-agent-orchestrator-legacy-teams/' },
  { term: 'GitHub Copilot', href: '/category/copilot/' },
  { term: 'GitHub Copilot Agent Mode', href: '/blog/ai-token-budget-daily-copilot-workflow/' },
  { term: 'GitHub Copilot Coding Agent', href: '/blog/agents-md-complete-playbook/' },
  { term: 'AI Coding', href: '/series/agents-md-instructions/' },
  { term: 'C#', href: '/category/programming/' },
  { term: 'Flutter', href: '/category/mobile/' },
  { term: '.NET MAUI', href: '/category/mobile/' },
  { term: 'Azure System Design', href: '/series/azure-production-issues/' },
  { term: 'Mobile App Security', href: '/series/azure-mobile-security/' },
  { term: 'Open Source', href: '/open-source/' },
  { term: 'AI Token Calculator', href: '/open-source/ai-token-calculator/' },
  { term: 'Short Videos', href: '/shorts/' },
];

/** The default for a page with no keywords of its own. */
export const SITE_KEYWORDS = [...BRAND_KEYWORDS, ...TOPIC_LINKS.map(({ term }) => term)];
