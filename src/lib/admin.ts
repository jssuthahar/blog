import { FIREBASE } from '../config';

/**
 * Admin console client.
 *
 * Talks to Firebase Auth and Firestore over REST rather than pulling in the
 * Firebase SDK — the admin page is the only place that needs auth, and the SDK
 * would cost ~80KB for two endpoints.
 *
 * Nothing here is a security boundary. `firestore.rules` decides what the
 * signed-in UID may do; this module only shapes the requests.
 */

const IDENTITY = 'https://identitytoolkit.googleapis.com/v1';
const SECURE_TOKEN = 'https://securetoken.googleapis.com/v1';
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;

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

/** ID tokens last an hour; refresh a minute early rather than on failure. */
async function freshToken(): Promise<string> {
  const session = loadSession();
  if (!session) throw new Error('NOT_SIGNED_IN');
  if (Date.now() < session.expiresAt - 60_000) return session.idToken;

  const res = await fetch(`${SECURE_TOKEN}/token?key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    clearSession();
    throw new Error('SESSION_EXPIRED');
  }

  return store({
    ...session,
    idToken: body.id_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + Number(body.expires_in) * 1000,
  }).idToken;
}

async function authed(path: string, init: RequestInit = {}): Promise<any> {
  const token = await freshToken();

  const res = await fetch(`${FIRESTORE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  return body;
}

const str = (f: any) => f?.stringValue ?? '';
const bool = (f: any) => f?.booleanValue === true;

// ---------------------------------------------------------------- testimonials

export interface AdminTestimonial {
  id: string;
  message: string;
  name: string;
  company: string;
  role: string;
  article: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  createdAt: string;
}

export async function listTestimonials(): Promise<AdminTestimonial[]> {
  const body = await authed('/testimonials?pageSize=300');

  return ((body.documents ?? []) as any[])
    .map((doc) => ({
      id: doc.name.split('/').pop() as string,
      message: str(doc.fields.message),
      name: str(doc.fields.name),
      company: str(doc.fields.company),
      role: str(doc.fields.role),
      article: str(doc.fields.article),
      status: (str(doc.fields.status) || 'pending') as AdminTestimonial['status'],
      featured: bool(doc.fields.featured),
      createdAt: doc.fields.createdAt?.timestampValue ?? doc.createTime,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** The rules allow only `status` and `featured` to change, so send only those. */
export async function moderateTestimonial(
  id: string,
  patch: { status?: AdminTestimonial['status']; featured?: boolean },
): Promise<void> {
  const fields: Record<string, unknown> = {};
  const mask: string[] = [];

  if (patch.status !== undefined) {
    fields.status = { stringValue: patch.status };
    mask.push('status');
  }
  if (patch.featured !== undefined) {
    fields.featured = { booleanValue: patch.featured };
    mask.push('featured');
  }

  const query = mask.map((f) => `updateMask.fieldPaths=${f}`).join('&');
  await authed(`/testimonials/${id}?${query}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await authed(`/testimonials/${id}`, { method: 'DELETE' });
  // The contact record shares the id; a missing one is not an error.
  await authed(`/testimonialContacts/${id}`, { method: 'DELETE' }).catch(() => {});
}

// ----------------------------------------------------------------- subscribers

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const body = await authed('/subscribers?pageSize=1000');

  return ((body.documents ?? []) as any[])
    .map((doc) => ({
      id: doc.name.split('/').pop() as string,
      email: str(doc.fields.email),
      source: str(doc.fields.source),
      createdAt: doc.fields.createdAt?.timestampValue ?? doc.createTime,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function deleteSubscriber(id: string): Promise<void> {
  await authed(`/subscribers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function toCsv(rows: Subscriber[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [
    'email,source,createdAt',
    ...rows.map((r) => [r.email, r.source, r.createdAt].map(escape).join(',')),
  ].join('\n');
}

// ---------------------------------------------------------- event registrations

export interface Registration {
  id: string;
  event: string;
  eventTitle: string;
  name: string;
  email: string;
  org: string;
  createdAt: string;
}

export async function listRegistrations(): Promise<Registration[]> {
  const body = await authed('/eventRegistrations?pageSize=1000');

  return ((body.documents ?? []) as any[])
    .map((doc) => ({
      id: doc.name.split('/').pop() as string,
      event: str(doc.fields.event),
      eventTitle: str(doc.fields.eventTitle),
      name: str(doc.fields.name),
      email: str(doc.fields.email),
      org: str(doc.fields.org),
      createdAt: doc.fields.createdAt?.timestampValue ?? doc.createTime,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function deleteRegistration(id: string): Promise<void> {
  await authed(`/eventRegistrations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function registrationsToCsv(rows: Registration[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [
    'event,eventTitle,name,email,org,createdAt',
    ...rows.map((r) =>
      [r.event, r.eventTitle, r.name, r.email, r.org, r.createdAt].map(escape).join(','),
    ),
  ].join('\n');
}

// -------------------------------------------------------------- contact messages

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const body = await authed('/contactMessages?pageSize=1000');

  return ((body.documents ?? []) as any[])
    .map((doc) => ({
      id: doc.name.split('/').pop() as string,
      name: str(doc.fields.name),
      email: str(doc.fields.email),
      subject: str(doc.fields.subject),
      message: str(doc.fields.message),
      status: (str(doc.fields.status) || 'new') as ContactMessage['status'],
      createdAt: doc.fields.createdAt?.timestampValue ?? doc.createTime,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** The rules allow only `status` to change, so send only that. */
export async function updateContactMessage(
  id: string,
  status: ContactMessage['status'],
): Promise<void> {
  await authed(`/contactMessages/${id}?updateMask.fieldPaths=status`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: { status: { stringValue: status } } }),
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await authed(`/contactMessages/${id}`, { method: 'DELETE' });
}

export function contactMessagesToCsv(rows: ContactMessage[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [
    'name,email,subject,message,status,createdAt',
    ...rows.map((r) =>
      [r.name, r.email, r.subject, r.message, r.status, r.createdAt].map(escape).join(','),
    ),
  ].join('\n');
}
