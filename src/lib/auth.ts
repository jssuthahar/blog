/**
 * Reader accounts.
 *
 * Optional by design: nothing on an article page depends on this module, and a
 * visitor who never signs in never loads it. An account exists only so that
 * appreciations, badges and a public profile belong to a person rather than to
 * one browser's localStorage.
 *
 * Two transports, on purpose:
 *
 * - **Firebase Auth SDK**, loaded lazily and only when someone actually clicks
 *   a provider button. OAuth popups are the one thing worth the bytes — doing
 *   Google/Microsoft/GitHub by hand means running each provider's dance
 *   yourself. The dynamic `import()` keeps it in its own chunk, so it is
 *   fetched on /signin and /profile and nowhere else.
 * - **REST for everything after that** — token refresh, sign-out, account
 *   deletion, and every Firestore call. Same approach as the admin console
 *   ([admin.ts](./admin.ts)), and it means the article page can record an
 *   appreciation with a plain `fetch` and no SDK at all.
 *
 * Nothing here is a security boundary. `firestore.rules` decides what a uid may
 * do; this module only holds the token and shapes requests.
 */

import { FIREBASE } from '../config';

const IDENTITY = 'https://identitytoolkit.googleapis.com/v1';
const SECURE_TOKEN = 'https://securetoken.googleapis.com/v1';

/**
 * Separate from the admin console's `admin:session`, so signing in as a reader
 * in the same browser can never clobber an admin session or vice versa.
 */
export const SESSION_KEY = 'msdev:auth:v1';

/** Fires on sign-in and sign-out so the header can repaint without a reload. */
export const AUTH_EVENT = 'msdev:auth';

export interface ReaderSession {
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string;
  /** Display name from the provider — the starting value for a profile. */
  name: string;
  /** Provider avatar URL. Profiles never upload an image; this is the default. */
  photo: string;
  /** e.g. 'google.com', 'github.com', 'password'. Shown in /profile. */
  provider: string;
  expiresAt: number;
}

export function loadSession(): ReaderSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ReaderSession) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: ReaderSession): ReaderSession {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: session }));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
}

export function signOut(): void {
  clearSession();
}

/**
 * A usable ID token, refreshed when it is close to expiry.
 *
 * Returns null rather than throwing when there is no session or the refresh
 * token has been revoked — every caller here is optional behaviour that must
 * degrade quietly, never break a page.
 */
export async function freshToken(): Promise<string | null> {
  const session = loadSession();
  if (!session) return null;

  // 60s of slack, so a token cannot expire between this check and the request.
  if (session.expiresAt - 60_000 > Date.now()) return session.idToken;

  try {
    const res = await fetch(`${SECURE_TOKEN}/token?key=${FIREBASE.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      }),
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body?.error?.message ?? 'REFRESH_FAILED');

    return storeSession({
      ...session,
      idToken: body.id_token,
      refreshToken: body.refresh_token,
      expiresAt: Date.now() + Number(body.expires_in) * 1000,
    }).idToken;
  } catch {
    // A revoked or expired refresh token means the session is over. Drop it so
    // the UI shows signed-out rather than retrying forever.
    clearSession();
    return null;
  }
}

// ------------------------------------------------------------------ providers

export type ProviderId = 'google.com' | 'microsoft.com' | 'github.com' | 'email';

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  'google.com': 'Google',
  'microsoft.com': 'Microsoft',
  'github.com': 'GitHub',
  email: 'Email',
};

/**
 * The Auth SDK, loaded once and cached.
 *
 * `firebase/app` and `firebase/auth` are ~45KB gzipped together. They are
 * imported dynamically so Vite emits them as a separate chunk that only the
 * pages calling this ever download.
 */
async function sdk() {
  const [{ initializeApp, getApps, getApp }, auth] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ]);

  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: FIREBASE.apiKey,
        authDomain: FIREBASE.authDomain,
        projectId: FIREBASE.projectId,
      });

  return { app, auth: auth.getAuth(app), lib: auth };
}

/** Maps a signed-in Firebase user onto the session shape stored locally. */
async function sessionFromUser(user: any, provider: string): Promise<ReaderSession> {
  const token = await user.getIdTokenResult();

  return storeSession({
    idToken: token.token,
    refreshToken: user.refreshToken,
    uid: user.uid,
    email: user.email ?? '',
    name: user.displayName ?? '',
    photo: user.photoURL ?? '',
    provider,
    expiresAt: +new Date(token.expirationTime),
  });
}

/**
 * OAuth sign-in through a popup.
 *
 * Popup, never redirect: the OAuth handler lives on `firebaseapp.com` while the
 * site is on `blog.msdevbuild.com`, and `signInWithRedirect` across those two
 * origins depends on a third-party cookie that Safari and Firefox block.
 */
export async function signInWithProvider(id: Exclude<ProviderId, 'email'>): Promise<ReaderSession> {
  const { auth, lib } = await sdk();

  const provider =
    id === 'google.com'
      ? new lib.GoogleAuthProvider()
      : id === 'github.com'
        ? new lib.GithubAuthProvider()
        : new lib.OAuthProvider('microsoft.com');

  const result = await lib.signInWithPopup(auth, provider);
  return sessionFromUser(result.user, id);
}

const EMAIL_KEY = 'msdev:auth:email';

/**
 * Passwordless email sign-in, step one.
 *
 * A link rather than a password: no password to store, no reset flow to build,
 * and nothing for this site to leak. The address is kept locally so step two
 * can complete without asking for it again on the same device.
 */
export async function sendEmailLink(email: string, returnTo: string): Promise<void> {
  const { auth, lib } = await sdk();

  await lib.sendSignInLinkToEmail(auth, email, {
    url: new URL(returnTo, location.origin).href,
    handleCodeInApp: true,
  });

  localStorage.setItem(EMAIL_KEY, email);
}

/** True when the current URL is an email sign-in link that needs completing. */
export async function isEmailLink(): Promise<boolean> {
  if (!location.search.includes('oobCode')) return false;
  const { auth, lib } = await sdk();
  return lib.isSignInWithEmailLink(auth, location.href);
}

/**
 * Passwordless email sign-in, step two.
 *
 * `email` is only needed when the link is opened on a different device from the
 * one that requested it — otherwise it comes back from localStorage.
 */
export async function completeEmailLink(email?: string): Promise<ReaderSession> {
  const { auth, lib } = await sdk();

  const address = email || localStorage.getItem(EMAIL_KEY) || '';
  if (!address) throw new Error('EMAIL_REQUIRED');

  const result = await lib.signInWithEmailLink(auth, address, location.href);
  localStorage.removeItem(EMAIL_KEY);
  return sessionFromUser(result.user, 'password');
}

/**
 * Deletes the Firebase Auth account itself.
 *
 * The caller is responsible for removing the reader's documents first — see
 * `deleteAccount()` in [community.ts](./community.ts), which does both in the
 * right order. Firebase requires a recent sign-in for this, so a stale session
 * gets CREDENTIAL_TOO_OLD_LOGIN_AGAIN and the UI asks them to sign in again.
 */
export async function deleteAuthAccount(): Promise<void> {
  const token = await freshToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const res = await fetch(`${IDENTITY}/accounts:delete?key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message ?? 'DELETE_FAILED');

  clearSession();
}
