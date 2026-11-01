#!/usr/bin/env node
/**
 * Queues a push notification for every newly published article AND short.
 *
 * This is the "automatic" half of the notification pipeline. Until now a send
 * started by hand in /admin; this script scans the blog collection and the
 * shorts collection after a deploy, finds items that went live recently and
 * have never been announced, and writes them to the same Firestore
 * `pushOutbox` the admin console writes to. scripts/drain-push-outbox.mjs
 * (cron, every 5 minutes) does the actual sending, so nothing here ever
 * touches the VAPID private key.
 *
 * Shorts are included alongside posts, not as an afterthought: a 20-second
 * short is a lower-friction reason to re-open the installed app than a
 * 12-minute article, which makes it arguably the more valuable one to push.
 *
 * Idempotency without a state file or a new collection: the outbox document id
 * is derived from the item's kind and slug (`post-<slug>` / `short-<slug>`)
 * and the write carries an `exists: false` precondition. Re-running for the
 * same item is a no-op, so this is safe on every deploy, on a re-run, and on
 * a manual dispatch alike. The two prefixes share one outbox and one batch
 * cap — a rush of posts and shorts on the same day is exactly the case the
 * cap exists to catch.
 *
 * Two guards stop it ever blasting the archive:
 *   - a publish window (default 7 days), so only genuinely new items qualify;
 *   - a batch cap (default 3), so a bulk import or a back-dated fix aborts with
 *     a message instead of firing a dozen notifications at once.
 *
 * Usage:
 *   node scripts/announce-new-posts.mjs                 # queue what's new
 *   node scripts/announce-new-posts.mjs --dry-run       # show, don't write
 *   node scripts/announce-new-posts.mjs --days 14       # wider window
 *   node scripts/announce-new-posts.mjs --max 10 --force  # override the cap
 *
 * One-time setup: the archive predates this script, so the first real run would
 * hit the batch cap on items nobody expects a notification for. Run
 *   node scripts/announce-new-posts.mjs --seed --days 3650
 * once to record every existing post AND short as already-announced (queued
 * and immediately marked `sent`, so nothing is delivered) — including the
 * shorts that predate this script gaining shorts support. Do it while the
 * send workflow is not mid-drain — the two writes are milliseconds apart, but
 * a drain landing exactly between them would deliver that row for real.
 *
 * Required env (GitHub Secrets): ADMIN_EMAIL, ADMIN_PASSWORD.
 * Optional: FIREBASE_API_KEY.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const PROJECT = 'msdevbuild-blog';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyC1oOQOPnd4i-6W0vXkhDHrzRAFYpd0nDk';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const CONTENT_DIR = 'src/content/blog';
const SHORTS_DIR = 'src/content/Real';

// firestore.rules caps these; truncate rather than let a long title 400.
const TITLE_MAX = 100;
const BODY_MAX = 300;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** Minimal flag parser: `--key value` and boolean `--flag`. */
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const DRY_RUN = Boolean(args['dry-run']);
const WINDOW_DAYS = Number(args.days ?? 7);
const MAX_BATCH = Number(args.max ?? 3);
const FORCE = Boolean(args.force);
// Record as announced without delivering — for the pre-existing archive.
const SEED = Boolean(args.seed);

// ---------------------------------------------------------------- frontmatter

/**
 * Pull a scalar off the top-level YAML frontmatter block. Same shape as the one
 * in check-seo.mjs — deliberately duplicated rather than shared, so the content
 * checks and this sender cannot break each other.
 */
function frontmatterValue(raw, key) {
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!line) return null;
  let v = line[1].trim();
  // Folded/literal block scalars (description: >) are multi-line; join them.
  if (v === '>' || v === '|' || v === '>-' || v === '|-') {
    const after = fm[1].slice(fm[1].indexOf(line[0]) + line[0].length);
    const block = [];
    for (const l of after.split('\n').slice(1)) {
      if (!/^\s+\S/.test(l)) break;
      block.push(l.trim());
    }
    v = block.join(' ');
  }
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.slice(1, -1);
  }
  return v.replace(/''/g, "'").trim();
}

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path, exts));
    else if (exts.includes(extname(path))) out.push(path);
  }
  return out;
}

function truncate(s, max) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

/** A Firestore-safe outbox id: the item's kind as a prefix, then its slug. */
function makeId(prefix, slug) {
  return `${prefix}-${slug.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 295)}`;
}

/**
 * Every publishable article, with the slug the site actually serves it under.
 *
 * The slug is the filename stem, NOT the path — content.config.ts strips
 * folders in generateId so articles can be grouped into series subfolders
 * without changing a URL. This must derive it the same way or the notification
 * would link to a 404.
 */
function readPosts() {
  return walk(CONTENT_DIR, ['.md', '.mdx'])
    .map((path) => {
      const raw = readFileSync(path, 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const publishedAt = frontmatterValue(raw, 'publishedAt');
      const slug = basename(path).replace(/\.(md|mdx)$/, '');
      return {
        kind: 'post',
        id: makeId('post', slug),
        url: `/blog/${slug}`,
        path,
        slug,
        title: frontmatterValue(raw, 'title'),
        description: frontmatterValue(raw, 'description'),
        draft: /^draft:\s*true\s*$/m.test(fm),
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      };
    })
    .filter((p) => p.title && p.description && p.publishedAt && !Number.isNaN(+p.publishedAt));
}

/** `<em>the</em> word` → `the word` — good enough for a push notification title. */
function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Every short, read straight from its `.spec.json` — no frontmatter parsing
 * needed, the spec already is structured data. Mirrors how lib/shorts.ts
 * derives the same fields, so a notification's title/body/slug can never
 * disagree with what the short's own page actually shows.
 *
 * A short with no `publishedAt` still publishes on the site (see
 * lib/shorts.ts) but is excluded here the same way it is excluded from
 * /contributions — an undated short has nothing for the announce window to
 * compare against, and guessing a date would risk announcing an old one.
 */
function readShorts() {
  return walk(SHORTS_DIR, ['.json'])
    .filter((path) => path.endsWith('.spec.json'))
    .map((path) => {
      let spec;
      try {
        spec = JSON.parse(readFileSync(path, 'utf8'));
      } catch {
        return null;
      }
      const slug = spec.slug || basename(path).replace(/\.spec\.json$/, '');
      const title = spec.title?.main ? stripTags(spec.title.main) : null;
      return {
        kind: 'short',
        id: makeId('short', slug),
        url: `/shorts/${slug}`,
        path,
        slug,
        title: spec.seoTitle || title,
        description: spec.title?.sub || null,
        draft: false,
        publishedAt: spec.publishedAt ? new Date(spec.publishedAt) : null,
      };
    })
    .filter((s) => s && s.title && s.description && s.publishedAt && !Number.isNaN(+s.publishedAt));
}

/** Published, not a draft, and inside the announce window. */
function isNew(item, now) {
  if (item.draft) return false;
  // A future publishedAt is scheduled — it will qualify on the deploy that
  // follows its date, not before it.
  if (+item.publishedAt > +now) return false;
  const ageDays = (+now - +item.publishedAt) / 86_400_000;
  return ageDays <= WINDOW_DAYS;
}

// ------------------------------------------------------------------ firestore

function requireEnv() {
  const missing = [];
  if (!ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (missing.length) {
    console.error(`✗ Missing env/secrets: ${missing.join(', ')}.`);
    process.exit(1);
  }
}

async function adminToken() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }),
    },
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`Admin sign-in failed: ${body?.error?.message || res.status}`);
  return body.idToken;
}

async function alreadyQueued(token, id) {
  const res = await fetch(`${BASE}/pushOutbox/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) return true;
  if (res.status === 404) return false;
  const body = await res.json().catch(() => ({}));
  throw new Error(`Outbox read failed: ${body?.error?.message || res.status}`);
}

/** Write one notification as `pending`. Mirrors admin.ts queuePushNotification. */
async function queue(token, post) {
  const name = `projects/${PROJECT}/databases/(default)/documents/pushOutbox/${post.id}`;

  const res = await fetch(`${BASE}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name,
            fields: {
              title: { stringValue: truncate(post.title, TITLE_MAX) },
              body: { stringValue: truncate(post.description, BODY_MAX) },
              url: { stringValue: post.url },
              status: { stringValue: 'pending' },
            },
          },
          // Server-stamped, so the rules' createdAt == request.time holds.
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
          // The precondition that makes this idempotent: a second run for the
          // same article fails here instead of queueing a duplicate.
          currentDocument: { exists: false },
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
}

/**
 * Close a just-queued row without sending it. The rules only ever allow a row
 * to be *created* as `pending`, so seeding is create-then-close rather than a
 * single write.
 */
async function markSeeded(token, post) {
  const name = `projects/${PROJECT}/databases/(default)/documents/pushOutbox/${post.id}`;
  const mask = ['status', 'sentAt', 'delivered']
    .map((f) => `updateMask.fieldPaths=${f}`)
    .join('&');

  const res = await fetch(`https://firestore.googleapis.com/v1/${name}?${mask}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'sent' },
        sentAt: { timestampValue: new Date().toISOString() },
        delivered: { integerValue: '0' },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Seed close failed for ${post.slug}: ${body?.error?.message || res.status}`);
  }
}

// ----------------------------------------------------------------------- main

async function main() {
  const now = new Date();
  // Posts and shorts share one window, one cap and one outbox — a rush of
  // both on the same day is exactly the case the cap exists to catch, and
  // splitting them would let a bulk import of one kind sneak past it.
  const candidates = [...readPosts(), ...readShorts()].filter((p) => isNew(p, now));

  if (!candidates.length) {
    console.log(`Nothing published in the last ${WINDOW_DAYS} day(s) — nothing to announce.`);
    return;
  }

  // A dry run without credentials is the normal local case: it still answers
  // "what would go out, and to which URL", just without the outbox lookup.
  const offline = DRY_RUN && (!ADMIN_EMAIL || !ADMIN_PASSWORD);
  if (offline) {
    console.log('No admin credentials — listing candidates without the already-announced check.\n');
    for (const post of candidates) {
      console.log(`would consider (${post.kind}): "${truncate(post.title, TITLE_MAX)}" → ${post.url}`);
    }
    return;
  }

  requireEnv();
  const token = await adminToken();

  // Ask the outbox which of these it has seen before, so the batch cap counts
  // only what would actually be sent.
  const fresh = [];
  for (const post of candidates) {
    if (await alreadyQueued(token, post.id)) {
      console.log(`· already announced — ${post.id}`);
    } else {
      fresh.push(post);
    }
  }

  if (!fresh.length) {
    console.log('Everything recent has already been announced.');
    return;
  }

  // Seeding delivers nothing, so the cap — which exists to stop a mass send —
  // does not apply to it.
  if (fresh.length > MAX_BATCH && !FORCE && !SEED) {
    console.error(
      `✗ ${fresh.length} un-announced item(s) in the last ${WINDOW_DAYS} day(s), cap is ${MAX_BATCH}.\n` +
        '  That usually means a bulk import or a back-dated publishedAt, not a real release.\n' +
        `  Re-run with --force (or --max ${fresh.length}) if you really want them all sent.`,
    );
    process.exit(1);
  }

  for (const post of fresh) {
    const line = `(${post.kind}) "${truncate(post.title, TITLE_MAX)}" → ${post.url}`;
    if (DRY_RUN) {
      console.log(`would ${SEED ? 'seed' : 'queue'}: ${line}`);
      continue;
    }
    await queue(token, post);
    if (SEED) {
      await markSeeded(token, post);
      console.log(`· seeded (not sent): ${line}`);
    } else {
      console.log(`✓ queued: ${line}`);
    }
  }

  if (DRY_RUN) return;

  console.log(
    SEED
      ? `${fresh.length} item(s) recorded as announced — nothing was delivered.`
      : `${fresh.length} notification(s) queued — the send job delivers within ~5 minutes.`,
  );
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
