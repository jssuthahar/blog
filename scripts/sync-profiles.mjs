#!/usr/bin/env node
/**
 * Pulls public reader profiles into a committed JSON cache the site renders at
 * build time.
 *
 * Same pattern as `sync-testimonials.mjs`, and for the same reason: a static
 * build cannot query Firestore per visitor, so `/u/<handle>/` is prerendered
 * from this file. A visitor viewing a profile therefore costs zero reads and
 * sees real HTML — which is also what makes the page indexable.
 *
 * Three filters decide what gets published:
 *
 *  1. `visibility == 'public'` — the reader has to have asked for it.
 *  2. Not flagged `hidden` in `moderation` — the admin's off switch.
 *  3. Substantial enough to deserve a URL (bio + at least one skill). A page
 *     with a name and nothing else is thin content, and thin pages drag the
 *     whole domain down in search.
 *
 * Runs as the admin, because `moderation` is admin-only readable.
 *
 * Run with `npm run sync:profiles`.
 */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  signInAsAdmin,
  listCollection,
  queryCollection,
  getDocument,
} from './lib/firestore.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'profiles.json');

const EMPTY = { syncedAt: null, count: 0, profiles: [] };

/** Splits the stored comma-separated string into chips / JSON-LD entries. */
const splitSkills = (value) =>
  String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

async function main() {
  const token = await signInAsAdmin();

  // The rules only permit reading a profile that is public, so the filter is
  // required rather than an optimisation.
  const [published, moderation, stats] = await Promise.all([
    queryCollection('profiles', { field: 'visibility', value: 'public' }, token),
    listCollection('moderation', token),
    listCollection('stats', token),
  ]);

  const hidden = new Set(moderation.filter((m) => m.hidden === true || m.banned === true).map((m) => m.id));
  const statsById = new Map(stats.map((s) => [s.id, s]));

  const profiles = [];

  for (const row of published) {
    if (hidden.has(row.id)) continue;

    const skills = splitSkills(row.skills);
    const bio = String(row.bio ?? '').trim();

    // Thin profiles stay unlisted. They still work at /u/?h=<handle>, which is
    // noindex — so the reader keeps their page without costing the site a
    // near-empty indexable URL.
    if (!bio || !skills.length) continue;

    const handle = String(row.handle ?? '').trim();
    if (!handle) continue;

    // Confirm the handle is really registered to this uid. The rules already
    // enforce it on write; re-checking here means a stale document can never
    // publish someone else's name.
    const owner = await getDocument(`handles/${handle}`, token);
    if (owner?.uid !== row.id) continue;

    const stat = statsById.get(row.id) ?? {};

    profiles.push({
      uid: row.id,
      handle,
      name: String(row.name ?? '').trim(),
      photo: String(row.photo ?? '').trim(),
      bio,
      skills,
      linkedin: String(row.linkedin ?? '').trim(),
      github: String(row.github ?? '').trim(),
      appreciations: Number(stat.appreciations ?? 0),
      articlesRead: Number(stat.articlesRead ?? 0),
      badges: Array.isArray(stat.badges) ? stat.badges : [],
      series: stat.series && typeof stat.series === 'object' ? stat.series : {},
      createdAt: row.createdAt ?? null,
      updatedAt: row.updatedAt ?? null,
    });
  }

  profiles.sort((a, b) => a.handle.localeCompare(b.handle));

  const payload = { syncedAt: new Date().toISOString(), count: profiles.length, profiles };

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`✓ ${profiles.length} public profile(s) → src/data/profiles.json`);
}

main().catch(async (error) => {
  console.error(`✗ Profile sync failed: ${error.message}`);

  try {
    const existing = JSON.parse(await readFile(OUT, 'utf8'));
    console.error(`  Keeping cached copy from ${existing.syncedAt} (${existing.count}).`);
  } catch {
    // First run with no cache: write an empty file so the build still works.
    await writeFile(OUT, `${JSON.stringify(EMPTY, null, 2)}\n`);
    console.error('  Wrote an empty cache so the build can continue.');
  }

  process.exit(1);
});
