import { FIREBASE, NEWSLETTER } from '../config';
import { withCampaign, campaignField } from './campaign';

/**
 * Newsletter signup, shared by the home-page popup and every inline form.
 *
 * Lives in one module so the two entry points cannot drift apart — a fix to
 * the Firestore write or the provider hand-off applies to both at once.
 */

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const SUBSCRIBED_KEY = 'newsletter:subscribed';

/**
 * What a subscriber can choose to get. Ids must match the admin portal
 * (msdevbuild-admin api/src/sites.js TOPICS) and firestore.rules, which only
 * accept a non-empty subset of these.
 */
export const TOPICS = [
  { id: 'azure', label: 'Azure certifications' },
  { id: 'blog', label: 'Blog articles & events' },
  { id: 'ai', label: 'AI Learning' },
] as const;
export type TopicId = (typeof TOPICS)[number]['id'];
const TOPIC_IDS: readonly string[] = TOPICS.map((t) => t.id);

/** True when at least one destination is configured. */
export const isEnabled = () =>
  FIREBASE.projectId.length > 0 || NEWSLETTER.action.length > 0;

/** Resolves to true when this was a new signup, false when already on the list. */
async function saveToFirestore(email: string, source: string, topics: string[]): Promise<boolean> {
  if (!FIREBASE.projectId) return true;

  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;

  // The document name travels in the JSON body, not a URL path, so it must NOT
  // be percent-encoded — encoding produced IDs like `name%40example.com`.
  // Firestore accepts `@` and `.` in IDs; `/` is the only character that would
  // break the path, and an email cannot contain one.
  const docId = email;

  const res = await withCampaign((campaign) => fetch(`${base}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `projects/${FIREBASE.projectId}/databases/(default)/documents/subscribers/${docId}`,
            fields: {
              email: { stringValue: email },
              source: { stringValue: source },
              topics: { arrayValue: { values: topics.map((t) => ({ stringValue: t })) } },
              ...campaignField(campaign).fields,
            },
          },
          updateMask: { fieldPaths: ['email', 'source', 'topics', ...campaignField(campaign).paths] },
          // Server-stamped so the rules can require createdAt == request.time.
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
          // A true create: a repeat signup fails rather than overwriting, so
          // the original signup date survives.
          currentDocument: { exists: false },
        },
      ],
    }),
  }));

  if (res.ok) return true;

  const body = await res.json().catch(() => ({}));

  // A failed `exists: false` precondition comes back as ALREADY_EXISTS (409).
  // That means they are already on the list — not an error to show anyone.
  const status = body?.error?.status;
  if (status === 'ALREADY_EXISTS' || status === 'FAILED_PRECONDITION') return false;

  throw new Error(body?.error?.message || `HTTP ${res.status}`);
}

async function sendToProvider(email: string): Promise<void> {
  if (!NEWSLETTER.action) return;

  // The provider's automation is what actually sends the welcome email.
  // no-cors because these public form endpoints send no CORS headers; the
  // response is opaque, so a provider-side failure is not observable here.
  await fetch(NEWSLETTER.action, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email_address: email, email }),
  });
}

export type SubscribeResult = 'subscribed' | 'already-subscribed';

/**
 * Stores the address and hands it to the email provider.
 * Rejects only when the address is invalid or could not be stored.
 */
export async function subscribe(rawEmail: string, source: string, picked: string[] = [...TOPIC_IDS]): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    throw new Error('invalid-email');
  }
  const topics = [...new Set(picked)].filter((t) => TOPIC_IDS.includes(t));
  if (!topics.length) throw new Error('no-topics');

  const [isNew] = await Promise.all([
    saveToFirestore(email, source, topics),
    sendToProvider(email),
  ]);

  localStorage.setItem(SUBSCRIBED_KEY, '1');
  return isNew ? 'subscribed' : 'already-subscribed';
}
