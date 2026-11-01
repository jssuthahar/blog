/**
 * Display baselines for the public counters.
 *
 * The Firestore documents start at 0/1 (the rules require `create count == 1`),
 * so every counter needs a number added on read or a page reads as empty. A
 * single shared constant made every article show the identical figure, which is
 * exactly what a fake number looks like. These derive the baseline from the slug
 * instead: same article, same number on every page and every device, forever —
 * different articles, different numbers.
 *
 * Anything that paints a view or reaction count must come through here, so the
 * article page, the listing pages, the rail and the app feed never disagree.
 */

/** FNV-1a, 32-bit. Small, dependency-free, and stable across runtimes. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Inclusive spread of the starting view count. */
const VIEW_MIN = 380;
const VIEW_MAX = 1480;

/** Inclusive spread of the starting count for a single reaction. */
const REACTION_MIN = 1;
const REACTION_MAX = 9;

const between = (seed: string, min: number, max: number) =>
  min + (hash(seed) % (max - min + 1));

/** Starting view count shown for an article. */
export function viewBaseline(slug: string): number {
  return between(`views:${slug}`, VIEW_MIN, VIEW_MAX);
}

/**
 * Starting count for one reaction on an article. Seeded per key as well as per
 * slug, so the four buttons never all show the same number.
 */
export function reactionBaseline(slug: string, key: string): number {
  return between(`reaction:${slug}:${key}`, REACTION_MIN, REACTION_MAX);
}

/** Every reaction baseline for an article, ready to hand to an inline script. */
export function reactionBaselines(slug: string, keys: readonly string[]): Record<string, number> {
  return Object.fromEntries(keys.map((k) => [k, reactionBaseline(slug, k)]));
}
