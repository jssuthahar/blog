/**
 * Reader-side Firestore access: appreciations, handles, profiles, progress.
 *
 * REST rather than the Firestore SDK, matching the rest of the site — the Auth
 * SDK is the only Firebase bundle we pay for, and it is confined to /signin and
 * /profile. Everything here is a plain `fetch` and works from an inline script
 * on an article page with nothing imported at all.
 *
 * `firestore.rules` is the security boundary. Every shape below is written to
 * satisfy it exactly; if a call here is refused, the rules are right and this
 * file is wrong.
 */

import { FIREBASE } from '../config';
import { freshToken, deleteAuthAccount, clearSession } from './auth';

const ROOT = `projects/${FIREBASE.projectId}/databases/(default)/documents`;
const BASE = `https://firestore.googleapis.com/v1/${ROOT}`;

// ------------------------------------------------------------ value encoding

type Value = Record<string, unknown>;

/** JS value → Firestore REST typed value. */
export function encode(v: unknown): Value {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
  return { mapValue: { fields: fields(v as Record<string, unknown>) } };
}

/** Firestore REST typed value → JS value. */
export function decode(f: any): any {
  if (!f || typeof f !== 'object') return undefined;
  if ('stringValue' in f) return f.stringValue;
  if ('booleanValue' in f) return f.booleanValue;
  if ('integerValue' in f) return Number(f.integerValue);
  if ('doubleValue' in f) return f.doubleValue;
  if ('timestampValue' in f) return f.timestampValue;
  if ('nullValue' in f) return null;
  if ('arrayValue' in f) return (f.arrayValue.values ?? []).map(decode);
  if ('mapValue' in f) return values(f.mapValue.fields ?? {});
  return undefined;
}

export const fields = (obj: Record<string, unknown>): Record<string, Value> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, encode(v)]));

export const values = (f: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]));

// ------------------------------------------------------------------ transport

/** A document read. Public documents need no token; pass one for private reads. */
export async function readDoc(path: string, token?: string | null): Promise<any | null> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const body = await res.json();
  return values(body.fields ?? {});
}

interface WriteOptions {
  /** Field names to write. Anything omitted keeps its stored value. */
  mask?: string[];
  /** Fields the server stamps with its own clock, e.g. `createdAt`. */
  serverTimestamps?: string[];
  /** true = must not exist (a real create), false = must already exist. */
  mustExist?: boolean;
}

/**
 * A single write through `:commit`.
 *
 * `:commit` rather than `PATCH` because only it carries `updateTransforms`, and
 * every collection here is server-stamped so the rules can require
 * `createdAt == request.time` — a client cannot backdate its own history.
 */
export async function writeDoc(
  path: string,
  data: Record<string, unknown>,
  { mask, serverTimestamps = [], mustExist }: WriteOptions = {},
): Promise<void> {
  const token = await freshToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const write: Record<string, unknown> = {
    update: { name: `${ROOT}/${path}`, fields: fields(data) },
    updateMask: { fieldPaths: mask ?? Object.keys(data) },
  };

  if (serverTimestamps.length) {
    write.updateTransforms = serverTimestamps.map((fieldPath) => ({
      fieldPath,
      setToServerValue: 'REQUEST_TIME',
    }));
  }

  if (mustExist !== undefined) write.currentDocument = { exists: mustExist };

  const res = await fetch(`${BASE}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ writes: [write] }),
  });

  if (res.ok) return;

  const body = await res.json().catch(() => ({}));
  throw new Error(body?.error?.status || body?.error?.message || `HTTP ${res.status}`);
}

export async function removeDoc(path: string): Promise<void> {
  const token = await freshToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const res = await fetch(`${BASE}/${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  // A missing document is the state we wanted anyway.
  if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
}

/** A `where field == value` query. Rules require the filter to match the caller. */
async function queryDocs(collection: string, field: string, value: unknown): Promise<any[]> {
  const token = await freshToken();
  if (!token) return [];

  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: encode(value) },
        },
        limit: 1000,
      },
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const rows = await res.json();
  return (rows as any[])
    .filter((r) => r.document)
    .map((r) => ({ id: r.document.name.split('/').pop(), ...values(r.document.fields ?? {}) }));
}

// -------------------------------------------------------------- appreciations

export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful';

export interface Appreciation {
  id: string;
  uid: string;
  slug: string;
  type: ReactionType;
  source: 'live' | 'claimed';
  createdAt: string;
}

/** The document id the rules require: one row per reader per article. */
export const appreciationId = (uid: string, slug: string) => `${uid}__${slug}`;

/**
 * Records an appreciation.
 *
 * `mustExist: false` makes this a true create, so a second reaction on the same
 * article is a no-op instead of overwriting the original timestamp — the first
 * one is the one that happened. ALREADY_EXISTS is therefore success, not an
 * error, and the caller does not need to check first (which would cost a read).
 */
export async function recordAppreciation(
  uid: string,
  slug: string,
  type: ReactionType,
  source: 'live' | 'claimed' = 'live',
): Promise<void> {
  try {
    await writeDoc(
      `appreciations/${appreciationId(uid, slug)}`,
      { uid, slug, type, source },
      { serverTimestamps: ['createdAt'], mustExist: false },
    );
  } catch (err) {
    const code = String((err as Error).message);
    if (code === 'ALREADY_EXISTS' || code === 'FAILED_PRECONDITION') return;
    throw err;
  }
}

export const listAppreciations = (uid: string) =>
  queryDocs('appreciations', 'uid', uid) as Promise<Appreciation[]>;

export const removeAppreciation = (uid: string, slug: string) =>
  removeDoc(`appreciations/${appreciationId(uid, slug)}`);

// --------------------------------------------------------- handles & profiles

export interface Profile {
  handle: string;
  name: string;
  photo: string;
  bio: string;
  /** Comma-separated — see the note in firestore.rules on why it is a string. */
  skills: string;
  linkedin: string;
  github: string;
  visibility: 'public' | 'private';
  createdAt?: string;
  updatedAt?: string;
}

export const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,29}$/;

/** Kept in step with the reserved list in firestore.rules. */
export const RESERVED_HANDLES = [
  'admin', 'about', 'blog', 'search', 'profile',
  'signin', 'settings', 'suthahar', 'msdevbuild', 'support',
];

export const handleError = (handle: string): string =>
  !HANDLE_RE.test(handle)
    ? 'Use 3–30 characters: lowercase letters, numbers and hyphens, starting with a letter or number.'
    : RESERVED_HANDLES.includes(handle)
      ? 'That handle is reserved.'
      : '';

/** Public: resolves a handle to a uid for the /u/ fallback page. */
export const lookupHandle = (handle: string) =>
  readDoc(`handles/${handle}`) as Promise<{ uid: string } | null>;

/**
 * Claims a handle.
 *
 * The handle is the document id, so uniqueness costs nothing: a create against
 * a taken one fails and the first claimant keeps it. ALREADY_EXISTS is a real
 * error here — unlike an appreciation, the caller needs to hear about it.
 */
export async function claimHandle(uid: string, handle: string): Promise<void> {
  await writeDoc(`handles/${handle}`, { uid }, { serverTimestamps: ['createdAt'], mustExist: false });
}

export const releaseHandle = (handle: string) => removeDoc(`handles/${handle}`);

export const getProfile = (uid: string, token?: string | null) =>
  readDoc(`profiles/${uid}`, token) as Promise<Profile | null>;

/**
 * Creates or updates a profile.
 *
 * Two shapes, because the rules treat them differently: a create stamps
 * `createdAt`, an update must leave it exactly as it was. The create is
 * attempted first and ALREADY_EXISTS falls through to the update, which saves a
 * read on every save.
 *
 * The caller MUST have claimed the handle already — the rules check
 * `get(handles/<handle>).uid == uid`, and rules `get()` sees the state before
 * the current commit, so the two writes can never be batched together.
 */
export async function saveProfile(uid: string, profile: Profile): Promise<void> {
  const data = {
    handle: profile.handle,
    name: profile.name,
    photo: profile.photo ?? '',
    bio: profile.bio ?? '',
    skills: profile.skills ?? '',
    linkedin: profile.linkedin ?? '',
    github: profile.github ?? '',
    visibility: profile.visibility,
  };

  try {
    await writeDoc(`profiles/${uid}`, data, {
      serverTimestamps: ['createdAt', 'updatedAt'],
      mustExist: false,
    });
  } catch (err) {
    const code = String((err as Error).message);
    if (code !== 'ALREADY_EXISTS' && code !== 'FAILED_PRECONDITION') throw err;

    await writeDoc(`profiles/${uid}`, data, {
      serverTimestamps: ['updatedAt'],
      mustExist: true,
    });
  }
}

/** The reader's email, stored where only they and the admin can read it. */
export const saveContact = (uid: string, email: string, provider: string) =>
  writeDoc(`profileContacts/${uid}`, { email, provider }, { serverTimestamps: ['updatedAt'] });

// -------------------------------------------------------------- progress

export interface ProgressEntry {
  pct: number;
  completedAt: number;
}

export const getProgress = (uid: string, token?: string | null) =>
  readDoc(`progress/${uid}`, token) as Promise<{ read: Record<string, ProgressEntry> } | null>;

export const saveProgress = (uid: string, read: Record<string, ProgressEntry>) =>
  writeDoc(`progress/${uid}`, { read }, { serverTimestamps: ['updatedAt'] });

// ----------------------------------------------------------------- stats

export interface ReaderStats {
  appreciations: number;
  articlesRead: number;
  badges: string[];
  /** Series slug → percentage complete, 0–100. */
  series: Record<string, number>;
  updatedAt?: string;
}

/** Public — the profile page shows it, and the nightly Action writes it. */
export const getStats = (uid: string) => readDoc(`stats/${uid}`) as Promise<ReaderStats | null>;

// -------------------------------------------------------------- account close

/**
 * Deletes everything this reader owns, then the account itself.
 *
 * Order matters: the documents are removed while the token is still valid, and
 * the Auth account goes last. `stats/{uid}` is admin-write-only so it cannot be
 * removed from here — the nightly evaluator prunes stats with no owner left.
 */
export async function deleteAccount(uid: string, handle: string): Promise<void> {
  const mine = await listAppreciations(uid).catch(() => [] as Appreciation[]);
  for (const row of mine) await removeDoc(`appreciations/${row.id}`).catch(() => {});

  await removeDoc(`profiles/${uid}`).catch(() => {});
  await removeDoc(`profileContacts/${uid}`).catch(() => {});
  await removeDoc(`progress/${uid}`).catch(() => {});
  if (handle) await releaseHandle(handle).catch(() => {});

  try {
    await deleteAuthAccount();
  } catch {
    // The documents are already gone; make sure the browser forgets the session
    // even if Firebase wants a fresh sign-in before deleting the account.
    clearSession();
    throw new Error('REAUTH_REQUIRED');
  }
}
