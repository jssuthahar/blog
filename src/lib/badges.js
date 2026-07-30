/**
 * Badge definitions — the single source of truth for what a reader can earn.
 *
 * Plain ESM with JSDoc types rather than TypeScript, because two very different
 * things import it: the profile pages (through Vite) and
 * `scripts/evaluate-badges.mjs` (through plain Node, no build step). One file
 * means the badge shown on a profile and the badge the nightly Action awards can
 * never drift apart.
 *
 * Awarding happens ONLY in that nightly Action, signed in as the admin — the
 * rules make `stats/{uid}` admin-write-only, so nothing client-side can grant a
 * badge. This file just says what the criteria are.
 *
 * @typedef {object} ReaderFacts
 * @property {number} appreciations      Articles appreciated, any source.
 * @property {number} liveAppreciations  Recorded at click time — trustworthy.
 * @property {number} articlesRead       Self-reported from reading history.
 * @property {Record<string, number>} series  Series slug → percent complete.
 * @property {number} accountAgeDays     Days since the account was created.
 * @property {number} createdAt          Account creation, epoch ms.
 *
 * @typedef {object} Badge
 * @property {string} id
 * @property {string} label
 * @property {string} description   Shown on the profile and in the tooltip.
 * @property {string} glyph         1–3 characters drawn in the badge circle.
 * @property {(facts: ReaderFacts) => boolean} earned
 * @property {boolean} [soft]       True when the evidence is self-reported.
 */

/**
 * Accounts opened in the first year get a founder mark. Fixed date rather than
 * "first N readers", which would need a global count nobody can verify offline.
 */
export const EARLY_READER_CUTOFF = Date.UTC(2027, 6, 31);

/** @type {Badge[]} */
export const BADGES = [
  {
    id: 'first-appreciation',
    label: 'First appreciation',
    description: 'Appreciated an article while signed in.',
    glyph: '1',
    earned: (f) => f.liveAppreciations >= 1,
  },
  {
    id: 'ten-appreciations',
    label: 'Ten appreciations',
    description: 'Appreciated ten different articles.',
    glyph: '10',
    earned: (f) => f.appreciations >= 10,
  },
  {
    id: 'fifty-appreciations',
    label: 'Fifty appreciations',
    description: 'Appreciated fifty different articles.',
    glyph: '50',
    earned: (f) => f.appreciations >= 50,
  },
  {
    id: 'series-finisher',
    label: 'Series finisher',
    description: 'Finished every part of a series.',
    glyph: '●',
    soft: true,
    earned: (f) => Object.values(f.series ?? {}).some((pct) => pct >= 100),
  },
  {
    id: 'deep-reader',
    label: 'Deep reader',
    description: 'Read twenty-five articles end to end.',
    glyph: '25',
    soft: true,
    earned: (f) => f.articlesRead >= 25,
  },
  {
    id: 'early-reader',
    label: 'Early reader',
    description: 'Joined in the first year of reader accounts.',
    glyph: '✦',
    earned: (f) => f.createdAt > 0 && f.createdAt < EARLY_READER_CUTOFF,
  },
  {
    id: 'anniversary',
    label: 'One year in',
    description: 'A year since joining.',
    glyph: '1y',
    earned: (f) => f.accountAgeDays >= 365,
  },
];

/** @param {string} id */
export const badgeById = (id) => BADGES.find((b) => b.id === id);

/**
 * The badges a reader has earned, as ids.
 *
 * @param {ReaderFacts} facts
 * @returns {string[]}
 */
export const earnedBadges = (facts) => BADGES.filter((b) => b.earned(facts)).map((b) => b.id);
