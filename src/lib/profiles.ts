import data from '../data/profiles.json';

/**
 * Public reader profiles, read from the committed cache that
 * `npm run sync:profiles` refreshes.
 *
 * A committed cache rather than a live query because the site is a static
 * build: `/u/<handle>/` is prerendered from this file, so a visitor pays no
 * Firestore reads and search engines get real HTML instead of an empty shell.
 * The trade-off is latency — a new profile appears at its own URL after the
 * next sync, and until then the client-rendered `/u/?h=<handle>` covers it.
 */

export interface PublicProfile {
  uid: string;
  handle: string;
  name: string;
  photo: string;
  bio: string;
  skills: string[];
  linkedin: string;
  github: string;
  appreciations: number;
  articlesRead: number;
  badges: string[];
  /** Series slug → percent complete. */
  series: Record<string, number>;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProfileIndex {
  syncedAt: string | null;
  count: number;
  profiles: PublicProfile[];
}

export const profileIndex = data as ProfileIndex;

export const allProfiles = (): PublicProfile[] => profileIndex.profiles;

export const profileByHandle = (handle: string): PublicProfile | undefined =>
  profileIndex.profiles.find((p) => p.handle === handle);

export const profileUrl = (handle: string): string => `/u/${handle}/`;

/** "Name (@handle)" — the heading and <title> on a profile page. */
export const profileTitle = (profile: PublicProfile): string =>
  `${profile.name} (@${profile.handle})`;
