import type { APIRoute } from 'astro';
import { SITE, AUTHOR } from '../../config';
import { getPublishedPosts, postUrl } from '../../lib/posts';
import { STEPS, UPDATED } from '../../lib/token-academy/steps';
import { STEP_QA, FAQ, FINAL_CHECK } from '../../lib/token-academy/questions';
import { MAKEOVERS, PART_LABEL } from '../../lib/token-academy/prompts';
import { MODELS, PRICES_CHECKED, SOURCES, fmtDate } from '../../lib/token-academy/pricing';

/**
 * Markdown twin of the AI Token Calculator, for AI crawlers.
 *
 * The page is interactive and shows one step at a time; an assistant reading
 * it needs the substance in order instead: every step's question and plain
 * answer, the final check with its answers, the price list,
 * the prompt makeovers and the FAQ. Built from the same data as the page, so
 * the two never disagree.
 */
export const GET: APIRoute = async () => {
  const pageUrl = `${SITE.url}/open-source/ai-token-calculator/`;
  const posts = new Map((await getPublishedPosts()).map((p) => [p.id, p]));
  const lines: string[] = [
    '# AI Token Calculator for GitHub Copilot',
    '',
    `> Count tokens in a prompt, code, JSON or log, see what a request costs in AI Credits on ${MODELS.length} GitHub Copilot models, and learn how Copilot bills tokens in ${STEPS.length} short lessons.`,
    '',
    `- **Author:** ${AUTHOR.name} (${AUTHOR.alternateName})`,
    `- **Updated:** ${UPDATED.toISOString().slice(0, 10)}`,
    `- **Interactive version:** ${pageUrl}`,
    `- **Prices:** GitHub’s published per-1M-token rates (${SOURCES.prices}), checked ${fmtDate(PRICES_CHECKED)}. 1 AI Credit = $0.01.`,
    '- **Privacy:** the calculator counts tokens in the browser with gpt-tokenizer; text is never sent to a server.',
    '',
  ];

  for (const step of STEPS) {
    const qa = STEP_QA[step.id];
    lines.push(`## Lesson ${step.n}: ${step.title}`, '', step.intro, '');
    if (qa) {
      lines.push(`### ${qa.q}`, '', qa.a, '');
      if (qa.tip) lines.push(`### ${qa.tip.q}`, '', qa.tip.a, '');
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
  }

  lines.push('## Final check', '');
  FINAL_CHECK.forEach((c, i) => lines.push(`${i + 1}. ${c.q} — **${c.options[c.correct]}.** ${c.why}`));
  lines.push('');

  // The calculator and the cost section sit outside the course but answer questions too.
  for (const id of ['calculator', 'billing']) {
    const qa = STEP_QA[id];
    lines.push(`## ${qa.q}`, '', qa.a, '');
  }
  lines.push('## GitHub Copilot model prices (USD per 1M tokens)', '', '| Model | Provider | Input | Cached | Cache write | Output | Long context |', '| --- | --- | ---: | ---: | ---: | ---: | --- |');
  for (const m of MODELS)
    lines.push(`| ${m.name} | ${m.provider} | $${m.in} | $${m.cached} | ${m.write ? `$${m.write}` : '—'} | $${m.out} | ${m.long ? `above ${m.long.over / 1000}K input: $${m.long.in} / $${m.long.out}` : '—'} |`);
  lines.push('');

  lines.push('## Frequently asked questions', '');
  for (const { q, a } of FAQ) lines.push(`### ${q}`, '', a, '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
