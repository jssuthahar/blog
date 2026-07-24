/**
 * Turns the /events/new editor fields into the exact Markdown file that goes in
 * src/content/events/. Shared so the form and any other tooling produce
 * byte-identical output, and validated against the same rules the content
 * collection enforces so the build never rejects a downloaded file.
 */

export type Registration = 'open' | 'external' | 'closed';

export interface EventDraft {
  slug: string;
  title: string;
  description: string;
  /** Datetime-local strings, e.g. "2026-09-18T18:00". */
  startDate: string;
  endDate: string;
  timezone: string;
  format: string;
  venue: string;
  location: string;
  online: boolean;
  joinUrl: string;
  host: string;
  price: string;
  capacity: string;
  /** Display-only baseline added to the live count (social proof). */
  registrationSeed: string;
  topics: string;
  registration: Registration;
  registrationUrl: string;
  cover: string;
  coverAlt: string;
  featured: boolean;
  draft: boolean;
  body: string;
}

export const EVENT_FORMATS: { value: string; label: string }[] = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'conference', label: 'Conference' },
  { value: 'launch', label: 'Launch' },
  { value: 'community', label: 'Community' },
];

export const emptyEventDraft = (): EventDraft => ({
  slug: '',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  timezone: 'IST',
  format: 'workshop',
  venue: '',
  location: 'Online',
  online: true,
  joinUrl: '',
  host: '',
  price: 'Free',
  capacity: '',
  registrationSeed: '',
  topics: '',
  registration: 'open',
  registrationUrl: '',
  cover: '',
  coverAlt: '',
  featured: false,
  draft: false,
  body: '',
});

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** YAML single-quote escaping: double any embedded single quote. */
const yq = (s: string) => `'${s.replace(/'/g, "''")}'`;

/** A datetime-local value ("2026-09-18T18:00") is emitted unquoted for YAML. */
const dt = (s: string) => s.trim();

export function toMarkdown(e: EventDraft): string {
  const topics = e.topics.split(',').map((t) => t.trim()).filter(Boolean);

  const front = [
    '---',
    `title: ${yq(e.title)}`,
    `description: ${yq(e.description)}`,
    `startDate: ${dt(e.startDate)}`,
    e.endDate ? `endDate: ${dt(e.endDate)}` : null,
    `timezone: ${yq(e.timezone)}`,
    `format: ${e.format}`,
    e.venue ? `venue: ${yq(e.venue)}` : null,
    `location: ${yq(e.location)}`,
    `online: ${e.online}`,
    e.joinUrl ? `joinUrl: ${yq(e.joinUrl)}` : null,
    e.host ? `host: ${yq(e.host)}` : null,
    `price: ${yq(e.price)}`,
    e.capacity ? `capacity: ${e.capacity}` : null,
    e.registrationSeed ? `registrationSeed: ${e.registrationSeed}` : null,
    topics.length ? `topics: [${topics.map(yq).join(', ')}]` : null,
    `registration: ${e.registration}`,
    e.registration === 'external' && e.registrationUrl ? `registrationUrl: ${yq(e.registrationUrl)}` : null,
    e.cover ? `cover: ${yq(e.cover)}` : null,
    e.cover && e.coverAlt ? `coverAlt: ${yq(e.coverAlt)}` : null,
    e.featured ? 'featured: true' : null,
    `draft: ${e.draft}`,
    '---',
    '',
    e.body.trim(),
    '',
  ];

  return front.filter((l) => l !== null).join('\n');
}

export interface Issue {
  field: string;
  message: string;
}

/** Mirrors the content-collection schema so the build won't reject the file. */
export function validate(e: EventDraft): Issue[] {
  const issues: Issue[] = [];
  const add = (field: string, message: string) => issues.push({ field, message });

  if (!e.title.trim()) add('title', 'Title is required.');
  if (e.title.length > 120) add('title', 'Title must be 120 characters or fewer.');

  if (!e.slug.trim()) add('slug', 'Slug is required.');
  else if (!/^[a-z0-9-]+$/.test(e.slug)) add('slug', 'Slug: lowercase letters, numbers, hyphens only.');
  else if (e.slug === 'new') add('slug', 'Slug "new" is reserved.');

  const d = e.description.trim().length;
  if (d < 20) add('description', `Description is ${d}/20 minimum characters.`);
  if (d > 300) add('description', 'Description must be 300 characters or fewer.');

  if (!e.startDate) add('startDate', 'Start date is required.');
  if (e.endDate && e.startDate && e.endDate < e.startDate)
    add('endDate', 'End must be after the start.');

  if (e.capacity && !/^[1-9]\d*$/.test(e.capacity))
    add('capacity', 'Capacity must be a positive whole number.');

  if (e.registrationSeed && !/^\d+$/.test(e.registrationSeed))
    add('registrationSeed', 'Registration seed must be a whole number (0 or more).');

  if (e.registration === 'external' && !e.registrationUrl.trim())
    add('registrationUrl', 'A registration URL is required when registration is "external".');

  if (e.cover && !e.coverAlt.trim())
    add('coverAlt', 'Cover alt text is required when a cover is set.');

  if (e.body.trim().length < 20) add('body', 'Description body is too short.');

  return issues;
}
