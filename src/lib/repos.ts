import data from '../data/repos.json';

export interface Repo {
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updated: string;
}

export interface RepoIndex {
  user: string;
  syncedAt: string;
  totalStars: number;
  totalForks: number;
  count: number;
  repos: Repo[];
}

export const repoIndex = data as RepoIndex;

/** Repos worth showing: they need a description to be worth a card. */
export function featuredRepos(limit = 6): Repo[] {
  return repoIndex.repos.filter((r) => r.description.length > 0).slice(0, limit);
}

export function allRepos(): Repo[] {
  return repoIndex.repos;
}

/** Brand colours for the languages actually present, matching GitHub's dots. */
export const LANGUAGE_COLORS: Record<string, string> = {
  'C#': '#178600',
  HTML: '#e34c26',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java: '#b07219',
  'C++': '#f34b7d',
  CSS: '#563d7c',
  Python: '#3572A5',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
};

export function languageColor(language: string | null): string {
  return (language && LANGUAGE_COLORS[language]) || '#8b949e';
}
