/**
 * The course outline, read from the markup itself, so the page, its schema and
 * its Markdown twin always list the same steps in the same order.
 */
import markup from './markup.html?raw';

export interface Step {
  id: string;
  n: number;
  title: string;
  intro: string;
}

const strip = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

export const STEPS: Step[] = [...markup.matchAll(/<section class="ta-step" id="([\w-]+)"[\s\S]*?<\/header>/g)].map(
  (m, i) => ({
    id: m[1],
    n: i + 1,
    title: strip(m[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? m[1]),
    intro: strip(m[0].match(/<p class="ta-sub">([\s\S]*?)<\/p>/)?.[1] ?? ''),
  }),
);

/** When the content and its prices were last checked. Shown on the page and in its schema. */
export const UPDATED = new Date('2026-11-06');
