import { FIREBASE } from '../config';

/**
 * Event registration, shared by every event detail page.
 *
 * Mirrors src/lib/subscribe.ts: a client-side Firestore REST commit gated
 * entirely by firestore.rules. Nothing here is a security boundary — the rules
 * decide what a write may contain. One commit does two things:
 *
 *   1. Creates the private `eventRegistrations/{slug}__{email}` document. The
 *      email in the id makes a repeat sign-up a no-op instead of a duplicate,
 *      and `exists: false` turns that into an ALREADY_EXISTS we can report.
 *   2. Increments the public `eventRegistrationCounts/{slug}.count`, so a page
 *      can show "N registered" without ever reading the private list (which
 *      holds attendee emails and is admin-only).
 *
 * Both writes share one commit, so the count can never move without a real,
 * new registration behind it.
 */

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const registeredKey = (slug: string) => `event:registered:${slug}`;

/** Firestore ids may contain `@` and `.` but not `/`; none can appear here. */
const docId = (slug: string, email: string) => `${slug}__${email}`;

export interface RegistrationInput {
  slug: string;
  eventTitle: string;
  name: string;
  email: string;
  org?: string;
}

export type RegisterResult = 'registered' | 'already-registered';

export const isEnabled = () => FIREBASE.projectId.length > 0;

export async function register(input: RegistrationInput): Promise<RegisterResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const org = (input.org ?? '').trim();

  if (name.length < 2) throw new Error('invalid-name');
  if (!EMAIL_RE.test(email)) throw new Error('invalid-email');

  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;
  const id = docId(input.slug, email);

  const fields: Record<string, unknown> = {
    event: { stringValue: input.slug },
    eventTitle: { stringValue: input.eventTitle },
    name: { stringValue: name },
    email: { stringValue: email },
  };
  const fieldPaths = ['event', 'eventTitle', 'name', 'email'];
  if (org) {
    fields.org = { stringValue: org };
    fieldPaths.push('org');
  }

  const res = await fetch(`${base}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `projects/${FIREBASE.projectId}/databases/(default)/documents/eventRegistrations/${id}`,
            fields,
          },
          updateMask: { fieldPaths },
          // Server-stamped so a registration cannot be backdated.
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
          // A true create: a repeat sign-up fails instead of overwriting.
          currentDocument: { exists: false },
        },
        {
          // Public counter — upserts and increments, like the view counter.
          update: {
            name: `projects/${FIREBASE.projectId}/databases/(default)/documents/eventRegistrationCounts/${input.slug}`,
            fields: {},
          },
          updateMask: { fieldPaths: [] },
          updateTransforms: [{ fieldPath: 'count', increment: { integerValue: '1' } }],
        },
      ],
    }),
  });

  if (res.ok) {
    try {
      localStorage.setItem(registeredKey(input.slug), '1');
    } catch {}
    return 'registered';
  }

  const body = await res.json().catch(() => ({}));
  const status = body?.error?.status;
  // A failed `exists: false` precondition means they already registered.
  if (status === 'ALREADY_EXISTS' || status === 'FAILED_PRECONDITION') {
    try {
      localStorage.setItem(registeredKey(input.slug), '1');
    } catch {}
    return 'already-registered';
  }

  throw new Error(body?.error?.message || `HTTP ${res.status}`);
}

/** Public read of the registration count. Returns 0 when the doc is absent. */
export async function getRegistrationCount(slug: string): Promise<number> {
  if (!FIREBASE.projectId) return 0;
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/eventRegistrationCounts/${slug}`;
  const doc = await fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  return Number(doc?.fields?.count?.integerValue ?? 0);
}
