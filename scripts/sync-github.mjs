#!/usr/bin/env node
/**
 * Syncs public repositories from GitHub into a committed JSON cache that the
 * open-source section renders at build time.
 *
 * Same reasoning as the article sync: the build must not depend on a live API
 * call, and GitHub's unauthenticated rate limit (60/hour per IP) is far too
 * low to hit on every build.
 *
 * Run with `npm run sync:repos`.
 */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const USER = 'jssuthahar';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'repos.json');

/** Repos that exist for site plumbing rather than as work worth showing. */
const EXCLUDE = new Set(['blog', 'jssuthahar', 'suthahar']);

async function main() {
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'msdevbuild-blog-sync',
        // A token lifts the rate limit in CI; optional locally.
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
    },
  );

  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);

  const all = await res.json();
  if (!Array.isArray(all)) throw new Error('Unexpected response shape');

  const repos = all
    .filter((r) => !r.fork && !r.archived && !r.private && !EXCLUDE.has(r.name))
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      url: r.html_url,
      homepage: r.homepage || null,
      language: r.language ?? null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      topics: r.topics ?? [],
      updated: r.pushed_at,
    }))
    // Stars first, then forks — forks signal people actually building on it.
    .sort((a, b) => b.stars - a.stars || b.forks - a.forks);

  const payload = {
    user: USER,
    syncedAt: new Date().toISOString(),
    totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
    count: repos.length,
    repos,
  };

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `✓ ${repos.length} repos (${payload.totalStars}★ ${payload.totalForks}⑂) → src/data/repos.json`,
  );
}

main().catch(async (error) => {
  console.error(`✗ GitHub sync failed: ${error.message}`);

  try {
    const existing = JSON.parse(await readFile(OUT, 'utf8'));
    console.error(`  Keeping cached copy from ${existing.syncedAt} (${existing.count} repos).`);
  } catch {
    console.error('  No cached copy exists yet.');
  }

  process.exit(1);
});
