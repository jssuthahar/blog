import { FIREBASE } from '../config';

/**
 * Contact-form submission.
 *
 * Mirrors src/lib/register.ts and the testimonial write: a client-side
 * Firestore REST commit gated entirely by firestore.rules. A static site can't
 * process a POST, so the message goes straight to Firestore, where the admin
 * console reads and manages it. Nothing here is a security boundary — the rules
 * decide what a `contactMessages` document may contain.
 *
 * Every message is its own document (a random id, not the email), so the same
 * person can send more than one and none overwrite each other.
 */

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const SUBJECTS = [
  'Speaking invitation',
  'Article feedback',
  'Community & collaboration',
  'Something else',
] as const;

export interface ContactInput {
  name: string;
  email: string;
  /** Optional — the reader may leave it blank. */
  phone?: string;
  subject: string;
  message: string;
}

export const isEnabled = () => FIREBASE.projectId.length > 0;

export async function sendContactMessage(input: ContactInput): Promise<void> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = (input.phone ?? '').trim().slice(0, 30);
  const subject = input.subject.trim() || 'Something else';
  const message = input.message.trim();

  if (name.length < 2) throw new Error('invalid-name');
  if (!EMAIL_RE.test(email)) throw new Error('invalid-email');
  if (message.length < 10) throw new Error('invalid-message');

  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;
  // A client-generated id lets this use commit(), which supports the
  // server-timestamp transform the rules require.
  const docId = crypto.randomUUID();

  // Phone is optional: only write the field (and name it in the mask) when the
  // reader actually supplied one, so blank submissions don't store an empty key.
  const fields: Record<string, { stringValue: string }> = {
    name: { stringValue: name },
    email: { stringValue: email },
    subject: { stringValue: subject },
    message: { stringValue: message },
    // Fixed here and enforced by the rules: a message can never
    // arrive pre-read or pre-archived.
    status: { stringValue: 'new' },
  };
  const fieldPaths = ['name', 'email', 'subject', 'message', 'status'];
  if (phone) {
    fields.phone = { stringValue: phone };
    fieldPaths.push('phone');
  }

  const res = await fetch(`${base}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `projects/${FIREBASE.projectId}/databases/(default)/documents/contactMessages/${docId}`,
            fields,
          },
          updateMask: { fieldPaths },
          // Server-stamped so a submission cannot be backdated.
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { exists: false },
        },
      ],
    }),
  });

  if (res.ok) return;

  const body = await res.json().catch(() => ({}));
  throw new Error(body?.error?.message || `HTTP ${res.status}`);
}
