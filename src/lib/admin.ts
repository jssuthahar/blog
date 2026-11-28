import { FIREBASE } from '../config';

/**
 * Admin sign-in for /preview (drafts). Firebase Auth over REST, no SDK.
 *
 * Moderation, subscribers, events and push moved to the private admin portal
 * (admin.msdevbuild.com, repo msdevbuild-admin). Only the session helpers the
 * draft preview needs stay here. Nothing here is a security boundary.
 */

const IDENTITY = 'https://identitytoolkit.googleapis.com/v1';
const SECURE_TOKEN = 'https://securetoken.googleapis.com/v1';

export interface Session {
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string;
  expiresAt: number;
}

const SESSION_KEY = 'admin:session';

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

/**
 * True when the signed-in account carries the `admin: true` custom claim that
 * the shared firestore.rules check (granted by msdevbuild-admin's
 * scripts/set-admin.mjs). Reads the token payload only — a UI gate, not a
 * security boundary; the rules are.
 */
export function hasAdminClaim(session: Pick<Session, 'idToken'> | null): boolean {
  try {
    const part = session?.idToken.split('.')[1] ?? '';
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json).admin === true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

function store(session: Session): Session {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const res = await fetch(`${IDENTITY}/accounts:signInWithPassword?key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? 'SIGN_IN_FAILED');

  return store({
    idToken: body.idToken,
    refreshToken: body.refreshToken,
    uid: body.localId,
    email: body.email,
    expiresAt: Date.now() + Number(body.expiresIn) * 1000,
  });
}

