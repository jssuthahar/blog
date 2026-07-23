import type { APIRoute } from 'astro';
import { SITE } from '../config';

/**
 * AI crawlers are explicitly welcomed. That is a deliberate trade: it allows
 * the content to be used for training and grounding, in exchange for being
 * cited in AI answers. Move an agent to the Disallow block to opt it out.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Bytespider',
];

export const GET: APIRoute = () => {
  const body = `# ${SITE.url}

User-agent: *
Allow: /

# AI crawlers and answer engines
${AI_CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE.url}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
