/**
 * Firestore rules tests.
 *
 * `firestore.rules` is the entire security boundary for this site — there is no
 * server in front of it — so the community collections get a test that proves
 * what they allow and, more importantly, what they refuse.
 *
 * Run with `npm run test:rules`, which starts the Firestore emulator around it.
 * Nothing here touches the real project.
 */

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

const ADMIN_UID = 'BVDLfgqNvJSZORv2zRitolBU3Cn2';
const READER = 'reader-uid-1';
const OTHER = 'reader-uid-2';

const env = await initializeTestEnvironment({
  projectId: 'demo-rules-check',
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: '127.0.0.1',
    port: 8080,
  },
});

const reader = env.authenticatedContext(READER).firestore();
const other = env.authenticatedContext(OTHER).firestore();
const admin = env.authenticatedContext(ADMIN_UID).firestore();
const guest = env.unauthenticatedContext().firestore();

/** A profile that satisfies every field rule, for mutating in individual tests. */
const profile = (over = {}) => ({
  handle: 'suthahar-dev',
  name: 'Test Reader',
  photo: 'https://example.com/a.jpg',
  bio: 'Building things.',
  skills: 'Azure, Flutter',
  linkedin: 'https://www.linkedin.com/in/someone',
  github: 'https://github.com/someone',
  visibility: 'public',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...over,
});

/**
 * Register a handle out-of-band.
 *
 * A profile write is only allowed if the handle it names is already registered
 * to that uid — and rules `get()` sees the state BEFORE the current commit, so
 * the two writes can never be batched. The client must claim the handle first
 * and write the profile second, which is what this helper mirrors.
 */
const claimHandle = (uid, handle) =>
  env.withSecurityRulesDisabled((ctx) =>
    setDoc(doc(ctx.firestore(), `handles/${handle}`), { uid, createdAt: new Date() }),
  );

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// --- reading is never gated -------------------------------------------------

test('anyone may still read view counts and reaction totals', async () => {
  await assertSucceeds(getDoc(doc(guest, 'views/some-post')));
  await assertSucceeds(getDoc(doc(guest, 'reactions/some-post')));
});

// --- appreciations ----------------------------------------------------------

test('a signed-in reader records their own appreciation', async () => {
  await assertSucceeds(
    setDoc(doc(reader, `appreciations/${READER}__my-post`), {
      uid: READER,
      slug: 'my-post',
      type: 'like',
      source: 'live',
      createdAt: serverTimestamp(),
    }),
  );
});

test('a signed-out visitor cannot record an appreciation', async () => {
  await assertFails(
    setDoc(doc(guest, `${'guest'}__my-post`.replace(/^/, 'appreciations/')), {
      uid: 'guest',
      slug: 'my-post',
      type: 'like',
      source: 'live',
      createdAt: serverTimestamp(),
    }),
  );
});

test('a reader cannot write an appreciation under another uid', async () => {
  await assertFails(
    setDoc(doc(other, `appreciations/${READER}__my-post`), {
      uid: READER,
      slug: 'my-post',
      type: 'like',
      source: 'live',
      createdAt: serverTimestamp(),
    }),
  );
});

test('the document id must match uid__slug, so a reader cannot fan out', async () => {
  await assertFails(
    setDoc(doc(reader, `appreciations/${READER}__other-post`), {
      uid: READER,
      slug: 'my-post',
      type: 'like',
      source: 'live',
      createdAt: serverTimestamp(),
    }),
  );
});

test('an unknown reaction type is refused', async () => {
  await assertFails(
    setDoc(doc(reader, `appreciations/${READER}__typed`), {
      uid: READER,
      slug: 'typed',
      type: 'appreciate',
      source: 'live',
      createdAt: serverTimestamp(),
    }),
  );
});

test('createdAt cannot be backdated to fake a long history', async () => {
  await assertFails(
    setDoc(doc(reader, `appreciations/${READER}__old`), {
      uid: READER,
      slug: 'old',
      type: 'like',
      source: 'live',
      createdAt: new Date('2019-01-01'),
    }),
  );
});

test("a reader cannot read someone else's appreciations", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `appreciations/${OTHER}__secret`), {
      uid: OTHER,
      slug: 'secret',
      type: 'like',
      source: 'live',
      createdAt: new Date(),
    });
  });
  await assertFails(getDoc(doc(reader, `appreciations/${OTHER}__secret`)));
  await assertSucceeds(getDoc(doc(admin, `appreciations/${OTHER}__secret`)));
});

// --- handles ----------------------------------------------------------------

test('a reader claims a free handle', async () => {
  await assertSucceeds(
    setDoc(doc(reader, 'handles/suthahar-dev'), { uid: READER, createdAt: serverTimestamp() }),
  );
});

test('a taken handle cannot be stolen', async () => {
  await claimHandle(READER, 'suthahar-dev');
  // A write to an existing document is an update, and handles are never
  // updatable — so the first claimant keeps it.
  await assertFails(
    setDoc(doc(other, 'handles/suthahar-dev'), { uid: OTHER, createdAt: serverTimestamp() }),
  );
});

test('reserved and malformed handles are refused', async () => {
  await assertFails(
    setDoc(doc(reader, 'handles/admin'), { uid: READER, createdAt: serverTimestamp() }),
  );
  await assertFails(
    setDoc(doc(reader, 'handles/No_Caps'), { uid: READER, createdAt: serverTimestamp() }),
  );
});

// --- profiles ---------------------------------------------------------------

test('a reader creates a profile for a handle they own', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertSucceeds(setDoc(doc(reader, `profiles/${READER}`), profile()));
});

test('a profile whose handle was never claimed is refused', async () => {
  await assertFails(setDoc(doc(reader, `profiles/${READER}`), profile()));
});

test('a profile cannot advertise a handle owned by someone else', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertFails(setDoc(doc(other, `profiles/${OTHER}`), profile()));
});

test('a private profile is hidden from the public and visible to its owner', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertSucceeds(setDoc(doc(reader, `profiles/${READER}`), profile({ visibility: 'private' })));
  await assertFails(getDoc(doc(guest, `profiles/${READER}`)));
  await assertSucceeds(getDoc(doc(reader, `profiles/${READER}`)));
  await assertSucceeds(getDoc(doc(admin, `profiles/${READER}`)));
});

test('a public profile is readable by anyone', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertSucceeds(setDoc(doc(reader, `profiles/${READER}`), profile()));
  await assertSucceeds(getDoc(doc(guest, `profiles/${READER}`)));
});

test('an off-site link is refused in the linkedin and github fields', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertFails(
    setDoc(doc(reader, `profiles/${READER}`), profile({ github: 'https://evil.example/someone' })),
  );
  await assertFails(
    setDoc(doc(reader, `profiles/${READER}`), profile({ linkedin: 'http://linkedin.com/in/x' })),
  );
});

test('an oversized bio is refused', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertFails(
    setDoc(doc(reader, `profiles/${READER}`), profile({ bio: 'x'.repeat(401) })),
  );
});

test('an unexpected field is refused', async () => {
  await claimHandle(READER, 'suthahar-dev');
  await assertFails(
    setDoc(doc(reader, `profiles/${READER}`), profile({ badges: ['fake-badge'] })),
  );
});

// --- private contact details ------------------------------------------------

test('a reader stores their email where nobody else can read it', async () => {
  await assertSucceeds(
    setDoc(doc(reader, `profileContacts/${READER}`), {
      email: 'reader@example.com',
      provider: 'google.com',
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(getDoc(doc(guest, `profileContacts/${READER}`)));
  await assertFails(getDoc(doc(other, `profileContacts/${READER}`)));
  await assertSucceeds(getDoc(doc(admin, `profileContacts/${READER}`)));
});

// --- stats: the score is admin-written --------------------------------------

test('stats are public to read', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `stats/${READER}`), { appreciations: 3, badges: ['first-appreciation'] });
  });
  await assertSucceeds(getDoc(doc(guest, `stats/${READER}`)));
});

test('a reader cannot award themselves a badge', async () => {
  await assertFails(
    setDoc(doc(reader, `stats/${READER}`), { appreciations: 9999, badges: ['series-finisher'] }),
  );
});

test('the admin writes stats', async () => {
  await assertSucceeds(
    setDoc(doc(admin, `stats/${READER}`), { appreciations: 3, badges: ['first-appreciation'] }),
  );
});

// --- moderation -------------------------------------------------------------

test('moderation flags are invisible to readers', async () => {
  await assertFails(getDoc(doc(reader, `moderation/${READER}`)));
  await assertSucceeds(setDoc(doc(admin, `moderation/${OTHER}`), { banned: true, hidden: true }));
});

test('a banned reader cannot write appreciations or a profile', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `moderation/${OTHER}`), { banned: true });
    await setDoc(doc(ctx.firestore(), 'handles/banned-one'), { uid: OTHER, createdAt: new Date() });
  });
  await assertFails(
    setDoc(doc(other, `appreciations/${OTHER}__post`), {
      uid: OTHER,
      slug: 'post',
      type: 'like',
      source: 'live',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(other, `profiles/${OTHER}`), profile({ handle: 'banned-one' })),
  );
});

// --- private reading progress ------------------------------------------------

test('reading progress is owner-only', async () => {
  await assertSucceeds(
    setDoc(doc(reader, `progress/${READER}`), {
      read: { 'a-post': { pct: 1, completedAt: 1 } },
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(getDoc(doc(other, `progress/${READER}`)));
});

// --- the existing collections are untouched ----------------------------------

test('the subscriber list is still not publicly readable', async () => {
  await assertFails(getDoc(doc(guest, 'subscribers/someone@example.com')));
});

let failed = 0;
for (const [name, fn] of tests) {
  await env.clearFirestore();
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`  FAIL ${name}\n       ${err.message.split('\n')[0]}`);
  }
}

await env.cleanup();

console.log(`\n${tests.length - failed}/${tests.length} rules tests passed`);
assert.equal(failed, 0, `${failed} rules test(s) failed`);
