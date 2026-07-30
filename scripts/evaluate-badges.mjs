#!/usr/bin/env node
/**
 * Recomputes every reader's stats and badges.
 *
 * This is the free-tier stand-in for a Cloud Function: `stats/{uid}` is
 * admin-write-only in the rules, so the score can only be written by something
 * holding the admin credentials — this script, running in a scheduled GitHub
 * Action. Nothing in the browser can award a badge, which is the whole point.
 *
 * Inputs and how much each can be trusted:
 *
 * - `appreciations` with `source: 'live'` — written at the moment of the click,
 *   one document per reader per article, id pinned to `uid__slug` by the rules.
 *   Solid.
 * - `appreciations` with `source: 'claimed'` — backfilled from a browser's
 *   localStorage on first sign-in. Self-asserted, so it counts towards totals
 *   but never towards `first-appreciation`.
 * - `progress` — mirrored up from localStorage. Self-reported: it drives
 *   "articles read" and the series rings, never a badge meant to be defensible.
 *   Slugs that do not match a published article are dropped.
 *
 * Manual grants from /admin live in `stats.manualBadges` and survive every run.
 *
 * Run with `npm run community:badges`.
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  signInAsAdmin,
  listCollection,
  writeDocument,
  deleteDocument,
} from './lib/firestore.mjs';
import { earnedBadges } from '../src/lib/badges.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = join(ROOT, 'src', 'content', 'blog');

const DAY = 86_400_000;

/**
 * Published articles and the series they belong to, read straight from the
 * content files — the same source the site builds from, so a series percentage
 * can never be based on articles that do not exist.
 */
async function readContent() {
  const slugs = new Set();
  /** @type {Record<string, string[]>} series id → slugs */
  const series = {};

  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      if (!/\.mdx?$/.test(entry.name)) continue;

      const raw = await readFile(path, 'utf8');
      const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? '';

      // Drafts are not published, so they cannot count towards anything.
      if (/^draft:\s*true\s*$/m.test(front)) continue;

      // The slug is the filename stem, whatever folder it sits in — the same
      // rule `src/content.config.ts` uses to build the URL.
      const slug = entry.name.replace(/\.mdx?$/, '');
      slugs.add(slug);

      const id = /^series:\s*["']?([^"'\r\n]+)["']?\s*$/m.exec(front)?.[1]?.trim();
      if (id) (series[id] ??= []).push(slug);
    }
  };

  await walk(BLOG);
  return { slugs, series };
}

async function main() {
  const token = await signInAsAdmin();
  const { slugs, series } = await readContent();

  const [appreciations, progress, profiles, existingStats] = await Promise.all([
    listCollection('appreciations', token),
    listCollection('progress', token),
    listCollection('profiles', token),
    listCollection('stats', token),
  ]);

  /** Every uid that has left any trace at all. */
  const uids = new Set([
    ...appreciations.map((a) => a.uid).filter(Boolean),
    ...progress.map((p) => p.id),
    ...profiles.map((p) => p.id),
  ]);

  const byUid = (rows, key = 'uid') => {
    const map = new Map();
    for (const row of rows) {
      const id = row[key];
      if (!id) continue;
      map.set(id, [...(map.get(id) ?? []), row]);
    }
    return map;
  };

  const appreciationsByUid = byUid(appreciations);
  const progressById = new Map(progress.map((p) => [p.id, p]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const statsById = new Map(existingStats.map((s) => [s.id, s]));

  let written = 0;

  for (const uid of uids) {
    const mine = appreciationsByUid.get(uid) ?? [];
    const live = mine.filter((a) => a.source === 'live');

    // Only articles that actually exist, so a stale or invented slug cannot
    // inflate a total.
    const read = Object.entries(progressById.get(uid)?.read ?? {}).filter(([slug]) => slugs.has(slug));
    const completed = new Set(read.filter(([, v]) => Number(v?.completedAt) > 0).map(([slug]) => slug));

    const seriesPct = {};
    for (const [id, parts] of Object.entries(series)) {
      if (!parts.length) continue;
      const done = parts.filter((slug) => completed.has(slug)).length;
      if (done) seriesPct[id] = Math.round((done / parts.length) * 100);
    }

    // Account age: the profile is the only record of when someone joined, so
    // fall back to their earliest appreciation when there is no profile yet.
    const stamps = [
      profileById.get(uid)?.createdAt,
      ...mine.map((a) => a.createdAt),
    ]
      .filter(Boolean)
      .map((s) => +new Date(s))
      .filter((n) => Number.isFinite(n) && n > 0);

    const createdAt = stamps.length ? Math.min(...stamps) : 0;

    const facts = {
      appreciations: mine.length,
      liveAppreciations: live.length,
      articlesRead: completed.size,
      series: seriesPct,
      createdAt,
      accountAgeDays: createdAt ? Math.floor((Date.now() - createdAt) / DAY) : 0,
    };

    // Manual grants from /admin are additive and never recomputed away.
    const manual = statsById.get(uid)?.manualBadges ?? [];
    const badges = [...new Set([...earnedBadges(facts), ...manual])];

    await writeDocument(
      `stats/${uid}`,
      {
        appreciations: facts.appreciations,
        liveAppreciations: facts.liveAppreciations,
        articlesRead: facts.articlesRead,
        badges,
        manualBadges: manual,
        series: seriesPct,
        createdAt: createdAt ? new Date(createdAt) : null,
      },
      token,
      { serverTimestamps: ['updatedAt'] },
    );

    written += 1;
  }

  // A reader who deletes their account cannot remove their own stats row — the
  // rules make it admin-only — so prune the ones with nothing left behind.
  let pruned = 0;
  for (const row of existingStats) {
    if (uids.has(row.id)) continue;
    await deleteDocument(`stats/${row.id}`, token);
    pruned += 1;
  }

  console.log(
    `✓ Stats written for ${written} reader(s)${pruned ? `, ${pruned} orphan row(s) pruned` : ''}.`,
  );
}

main().catch((error) => {
  console.error(`✗ Badge evaluation failed: ${error.message}`);
  process.exit(1);
});
