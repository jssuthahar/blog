/**
 * GitHub Copilot model prices: the one place every widget on
 * /open-source/ai-token-calculator/ reads them from. Copied from GitHub's
 * Models and pricing page; update the rows and PRICES_CHECKED together.
 *
 * All prices are USD per 1M tokens. `write` is the cache-write price, listed
 * only for Anthropic models and the GPT-5.6, GPT-6 and GPT-6.1 families.
 * `long` is the higher tier a request moves to once its input passes `over`
 * tokens. Context-window sizes are not published per model, so none are kept.
 */

export type Provider = 'OpenAI' | 'Anthropic' | 'Google' | 'Microsoft' | 'xAI' | 'Moonshot AI';
export type Tier = 'Lightweight' | 'Versatile' | 'Powerful';

interface Rates {
  in: number;
  cached: number;
  write?: number;
  out: number;
}

export interface ModelPrice extends Rates {
  name: string;
  provider: Provider;
  tier: Tier;
  long?: Rates & { over: number };
  note?: string;
}

/** When the rows below were last compared with GitHub's page. */
export const PRICES_CHECKED = new Date('2026-11-06');

export const SOURCES = {
  prices: 'https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing',
  billing: 'https://docs.github.com/en/copilot/concepts/billing-and-usage/organizations-and-enterprises/billing',
  auto: 'https://docs.github.com/en/copilot/concepts/auto-model-selection',
  reports: 'https://docs.github.com/en/billing/reference/billing-reports',
};

/** Plan facts the estimates use, all from GitHub's billing docs. */
export const PLAN = {
  usdPerCredit: 0.01,
  businessCredits: 1900,
  enterpriseCredits: 3900,
  /** Auto model selection, paid plans, in Copilot Chat and the cloud agent. */
  autoDiscount: 0.1,
};

const L = (over: number, r: Rates) => ({ over, ...r });

export const MODELS: ModelPrice[] = [
  { name: 'GPT-6 Luna', provider: 'OpenAI', tier: 'Lightweight', in: 0.1, cached: 0.01, write: 0.125, out: 0.5, long: L(272_000, { in: 0.2, cached: 0.02, write: 0.25, out: 0.75 }) },
  { name: 'GPT-5.4 nano', provider: 'OpenAI', tier: 'Lightweight', in: 0.2, cached: 0.02, out: 1.25 },
  { name: 'GPT-5.6 Luna', provider: 'OpenAI', tier: 'Lightweight', in: 0.2, cached: 0.02, write: 0.25, out: 1.2, long: L(200_000, { in: 0.4, cached: 0.04, write: 0.5, out: 1.8 }) },
  { name: 'GPT-6.1 Terra', provider: 'OpenAI', tier: 'Versatile', in: 1, cached: 0.05, write: 1.25, out: 5, long: L(272_000, { in: 2, cached: 0.1, write: 2.5, out: 7.5 }) },
  { name: 'GPT-5.3-Codex', provider: 'OpenAI', tier: 'Powerful', in: 1.75, cached: 0.175, out: 14 },
  { name: 'GPT-5.6 Terra', provider: 'OpenAI', tier: 'Versatile', in: 2, cached: 0.2, write: 2.5, out: 12, long: L(272_000, { in: 4, cached: 0.4, write: 5, out: 18 }) },
  { name: 'GPT-6 Sol', provider: 'OpenAI', tier: 'Powerful', in: 2, cached: 0.2, write: 2.5, out: 10, long: L(272_000, { in: 4, cached: 0.4, write: 5, out: 15 }) },
  { name: 'GPT-6.1 Sol', provider: 'OpenAI', tier: 'Powerful', in: 2, cached: 0.1, write: 2.5, out: 10, long: L(272_000, { in: 4, cached: 0.2, write: 5, out: 15 }), note: 'GitHub’s suggested replacement for GPT-5.5' },
  { name: 'GPT-5.6 Sol', provider: 'OpenAI', tier: 'Powerful', in: 4, cached: 0.4, write: 5, out: 20, long: L(272_000, { in: 8, cached: 0.8, write: 10, out: 30 }) },
  { name: 'GPT-6 Astra', provider: 'OpenAI', tier: 'Powerful', in: 10, cached: 1, write: 12.5, out: 50, long: L(272_000, { in: 20, cached: 2, write: 25, out: 75 }) },

  { name: 'Claude Haiku 5.5', provider: 'Anthropic', tier: 'Lightweight', in: 0.1, cached: 0.01, write: 0.125, out: 0.5, long: L(100_000, { in: 0.5, cached: 0.05, write: 0.625, out: 2.5 }) },
  { name: 'Claude Haiku 4.5', provider: 'Anthropic', tier: 'Versatile', in: 1, cached: 0.1, write: 1.25, out: 5 },
  { name: 'Claude Sonnet 5.5', provider: 'Anthropic', tier: 'Versatile', in: 2, cached: 0.1, write: 2.5, out: 10 },
  { name: 'Claude Sonnet 5', provider: 'Anthropic', tier: 'Versatile', in: 2, cached: 0.2, write: 2.5, out: 10 },
  { name: 'Claude Sonnet 4.6', provider: 'Anthropic', tier: 'Versatile', in: 3, cached: 0.3, write: 3.75, out: 15 },
  { name: 'Claude Sonnet 4', provider: 'Anthropic', tier: 'Versatile', in: 3, cached: 0.3, write: 3.75, out: 15 },
  { name: 'Claude Opus 5.5', provider: 'Anthropic', tier: 'Powerful', in: 4, cached: 0.2, write: 5, out: 20 },
  { name: 'Claude Opus 5', provider: 'Anthropic', tier: 'Powerful', in: 5, cached: 0.5, write: 6.25, out: 25 },
  { name: 'Claude Opus 4.8', provider: 'Anthropic', tier: 'Powerful', in: 5, cached: 0.5, write: 6.25, out: 25 },
  { name: 'Claude Opus 4.8 (fast mode)', provider: 'Anthropic', tier: 'Powerful', in: 10, cached: 1, write: 12.5, out: 50, note: 'Preview' },
  { name: 'Claude Fable 5', provider: 'Anthropic', tier: 'Powerful', in: 10, cached: 1, write: 12.5, out: 50 },
  { name: 'Claude Fable 5.1', provider: 'Anthropic', tier: 'Powerful', in: 10, cached: 0.25, write: 12.5, out: 50 },

  { name: 'Gemini 3.8 Flash', provider: 'Google', tier: 'Versatile', in: 0.75, cached: 0.075, out: 3.75, note: 'Promotional price until 31 Dec 2026' },
  { name: 'Gemini 4 Argon', provider: 'Google', tier: 'Powerful', in: 2, cached: 0.1, out: 10, note: 'Promotional price until 1 Dec 2026' },

  { name: 'MAI-Code-1.1-Flash', provider: 'Microsoft', tier: 'Lightweight', in: 0.2, cached: 0.02, out: 1.2 },

  { name: 'Grok 4.5', provider: 'xAI', tier: 'Versatile', in: 2, cached: 0.5, out: 6, long: L(200_000, { in: 4, cached: 1, out: 12 }) },
  { name: 'Grok 4.6', provider: 'xAI', tier: 'Versatile', in: 2, cached: 0.5, out: 6, long: L(200_000, { in: 4, cached: 1, out: 12 }) },
  { name: 'Grok 4.7', provider: 'xAI', tier: 'Versatile', in: 2, cached: 0.5, out: 6, long: L(200_000, { in: 4, cached: 1, out: 12 }) },

  { name: 'Kimi K3', provider: 'Moonshot AI', tier: 'Powerful', in: 3, cached: 0.3, out: 15 },
];

/** The model every example on the page is priced on unless the reader picks another. */
export const DEFAULT_MODEL = 'Claude Sonnet 5.5';

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
