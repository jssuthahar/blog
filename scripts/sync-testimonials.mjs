#!/usr/bin/env node
/**
 * Pulls approved testimonials from Firestore into a committed JSON cache the
 * pages render at build time.
 *
 * Baked in rather than fetched in the browser so the quotes are in the initial
 * HTML — visible to search engines and to readers before any JS runs. Approving
 * a testimonial in the Firebase console publishes it on the next build.
 *
 * Run with `npm run sync:testimonials`.
 */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PROJECT = 'msdevbuild-blog';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'testimonials.json');

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

/** Firestore wraps every value in a type tag; unwrap the ones we store. */
const value = (field) =>
  field?.stringValue ?? field?.booleanValue ?? field?.timestampValue ?? '';

async function main() {
  // Unauthenticated: the rules permit reading approved testimonials, so no
  // credential is involved on either side.
  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'testimonials' }],
        // The rules reject any read that is not filtered to approved, so this
        // filter is required rather than merely an optimisation.
        where: {
          fieldFilter: {
            field: { fieldPath: 'status' },
            op: 'EQUAL',
            value: { stringValue: 'approved' },
          },
        },
        limit: 500,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore responded ${res.status}: ${body.slice(0, 200)}`);
  }

  const rows = await res.json();

  const testimonials = rows
    .filter((row) => row.document)
    .map(({ document }) => ({
      id: document.name.split('/').pop(),
      message: value(document.fields.message),
      name: value(document.fields.name),
      company: value(document.fields.company),
      role: value(document.fields.role),
      article: value(document.fields.article),
      featured: document.fields.featured?.booleanValue === true,
      createdAt: value(document.fields.createdAt) || document.createTime,
    }))
    // Sorted here rather than in the query: an orderBy alongside the status
    // filter would require a composite index for no real benefit at this size.
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const payload = {
    syncedAt: new Date().toISOString(),
    count: testimonials.length,
    featuredCount: testimonials.filter((t) => t.featured).length,
    testimonials,
  };

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `✓ ${testimonials.length} approved testimonials (${payload.featuredCount} featured) → src/data/testimonials.json`,
  );
}

main().catch(async (error) => {
  console.error(`✗ Testimonial sync failed: ${error.message}`);

  try {
    const existing = JSON.parse(await readFile(OUT, 'utf8'));
    console.error(`  Keeping cached copy from ${existing.syncedAt} (${existing.count}).`);
  } catch {
    // First run with no cache: write an empty file so the build still works.
    await writeFile(
      OUT,
      `${JSON.stringify({ syncedAt: null, count: 0, featuredCount: 0, testimonials: [] }, null, 2)}\n`,
    );
    console.error('  Wrote an empty cache so the build can continue.');
  }

  process.exit(1);
});
