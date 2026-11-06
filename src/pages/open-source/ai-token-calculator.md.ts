import type { APIRoute } from 'astro';
import { SITE, AUTHOR } from '../../config';
import { getPublishedPosts, postUrl } from '../../lib/posts';
import { STEPS, UPDATED } from '../../lib/token-academy/steps';
import { STEP_QA, FAQ } from '../../lib/token-academy/questions';
import { TALES } from '../../lib/token-academy/stories';
import { MAKEOVERS, PART_LABEL } from '../../lib/token-academy/prompts';

/**
 * Markdown twin of the AI Token Calculator, for AI crawlers.
 *
 * The page is interactive and shows one step at a time; an assistant reading
 * it needs the substance in order instead: every step's question and plain
 * answer, the story that frames it, the check questions with their answers,
 * the prompt makeovers and the FAQ. Built from the same data as the page, so
 * the two never disagree.
 */
export const GET: APIRoute = async () => {
  const pageUrl = `${SITE.url}/open-source/ai-token-calculator/`;
  const posts = new Map((await getPublishedPosts()).map((p) => [p.id, p]));
  const lines: string[] = [
    '# AI Token Calculator for GitHub Copilot',
    '',
    '> Count tokens live, see what a request costs in AI Credits, and learn how GitHub Copilot bills tokens, in fourteen short steps from beginner to expert.',
    '',
    `- **Author:** ${AUTHOR.name} (${AUTHOR.alternateName})`,
    `- **Updated:** ${UPDATED.toISOString().slice(0, 10)}`,
    `- **Interactive version:** ${pageUrl}`,
    '- **Prices:** GitHub’s published per-1M-token rates, read 6 Nov 2026. 1 AI Credit = $0.01.',
    '- **Stories:** a scenario on MSDevBuild Eats, the open-source Flutter food delivery app (https://github.com/jssuthahar/food-delivery-app). The app and its files are real; the numbers are illustrative.',
    '',
  ];

  for (const step of STEPS) {
    const qa = STEP_QA[step.id];
    const tale = TALES[step.id];
    lines.push(`## Step ${step.n}: ${step.title}`, '', step.intro, '');
    if (tale) lines.push(`**Meera’s story: ${tale.title}.** ${tale.text}`, '');
    if (qa) {
      lines.push(`### ${qa.q}`, '', qa.a, '');
      const reads = (qa.read ?? []).map((s) => posts.get(s)).filter((p) => p !== undefined);
      if (reads.length)
        lines.push(`Read more: ${reads.map((p) => `[${p.data.title}](${new URL(postUrl(p), SITE.url).href})`).join(' · ')}`, '');
    }
    if (step.id === 'ask') {
      lines.push('### Prompt makeover: how people ask, and the best way to ask', '');
      for (const m of MAKEOVERS) {
        lines.push(`**Instead of “${m.ask}”, ask:**`, '');
        for (const [part, text] of m.best) lines.push(`- *${PART_LABEL[part]}:* ${text}`);
        lines.push('', `Why: ${m.why.join(' ')}`, '');
      }
    }
    if (qa?.checks?.length) {
      lines.push('**Check yourself:**', '');
      qa.checks.forEach((c, i) => lines.push(`${i + 1}. ${c.q} — **${c.options[c.correct]}.** ${c.why}`));
      lines.push('');
    }
  }

  lines.push('## Frequently asked questions', '');
  for (const { q, a } of FAQ) lines.push(`### ${q}`, '', a, '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
