/**
 * Firestore REST helpers for the scheduled scripts.
 *
 * The site has no server and Cloud Functions need a paid plan, so the trusted
 * work — awarding badges, publishing profiles — runs in a GitHub Action that
 * signs in as the admin account and talks to Firestore over REST. Same approach
 * as `send-push.mjs`, factored out so the two community scripts cannot drift.
 *
 * The admin password lives only in GitHub Secrets (and a gitignored `.env`
 * locally). Nothing here belongs in the browser.
 */

const PROJECT = 'msdevbuild-blog';
const API_KEY = 'AIzaSyC1oOQOPnd4i-6W0vXkhDHrzRAFYpd0nDk';

export const ROOT = `projects/${PROJECT}/databases/(default)/documents`;
export const BASE = `https://firestore.googleapis.com/v1/${ROOT}`;

/** Signs in as the admin account whose UID the rules trust. */
export async function signInAsAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD are required. Set them in .env locally, or as repository secrets in CI.',
    );
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const body = await res.json();
  if (!res.ok) throw new Error(`Admin sign-in failed: ${body?.error?.message ?? res.status}`);
  return body.idToken;
}

// ------------------------------------------------------------ value encoding

/** Firestore typed value → JS value. */
export function decode(f) {
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

/** JS value → Firestore typed value. */
export function encode(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
  return { mapValue: { fields: fields(v) } };
}

export const fields = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, encode(v)]));

export const values = (f) =>
  Object.fromEntries(Object.entries(f ?? {}).map(([k, v]) => [k, decode(v)]));

// ------------------------------------------------------------------ requests

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

/**
 * Every document in a collection, following pagination.
 *
 * Paged rather than one huge request so the job stays inside the free tier's
 * read budget as these collections grow — and so a slow page cannot time the
 * whole run out.
 */
export async function listCollection(name, token, pageSize = 300) {
  const out = [];
  let pageToken = '';

  do {
    const url = new URL(`${BASE}/${name}`);
    url.searchParams.set('pageSize', String(pageSize));
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Listing ${name} failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const body = await res.json();
    for (const document of body.documents ?? []) {
      out.push({
        id: document.name.split('/').pop(),
        createTime: document.createTime,
        ...values(document.fields),
      });
    }
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);

  return out;
}

/** A filtered query. Needed where the rules require a filter to allow the read. */
export async function queryCollection(name, filter, token) {
  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: name }],
        where: {
          fieldFilter: {
            field: { fieldPath: filter.field },
            op: 'EQUAL',
            value: encode(filter.value),
          },
        },
        limit: filter.limit ?? 1000,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Query on ${name} failed (${res.status}): ${body.slice(0, 200)}`);
  }

  return (await res.json())
    .filter((row) => row.document)
    .map(({ document }) => ({
      id: document.name.split('/').pop(),
      createTime: document.createTime,
      ...values(document.fields),
    }));
}

export async function getDocument(path, token) {
  const res = await fetch(`${BASE}/${path}`, { headers: authHeaders(token) });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Reading ${path} failed (${res.status})`);
  return values((await res.json()).fields);
}

/** A single write, with optional server-stamped fields. */
export async function writeDocument(path, data, token, { serverTimestamps = [] } = {}) {
  const write = {
    update: { name: `${ROOT}/${path}`, fields: fields(data) },
    updateMask: { fieldPaths: Object.keys(data) },
  };

  if (serverTimestamps.length) {
    write.updateTransforms = serverTimestamps.map((fieldPath) => ({
      fieldPath,
      setToServerValue: 'REQUEST_TIME',
    }));
  }

  const res = await fetch(`${BASE}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ writes: [write] }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Writing ${path} failed (${res.status}): ${body.slice(0, 200)}`);
  }
}

export async function deleteDocument(path, token) {
  const res = await fetch(`${BASE}/${path}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok && res.status !== 404) throw new Error(`Deleting ${path} failed (${res.status})`);
}
