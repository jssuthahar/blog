import { getCollection, type CollectionEntry } from 'astro:content';

export type HostedEvent = CollectionEntry<'events'>;

export const EVENT_FORMAT_LABELS = {
  workshop: 'Workshop',
  webinar: 'Webinar',
  meetup: 'Meetup',
  conference: 'Conference',
  launch: 'Launch',
  community: 'Community',
} as const;

/** Reserved ids that must never render as a real event. */
const RESERVED = new Set(['readme']);

async function loadEvents(): Promise<HostedEvent[]> {
  return (await getCollection('events')).filter(
    (e) => !RESERVED.has(e.id.toLowerCase()) && !e.data.draft,
  );
}

export function eventUrl(event: HostedEvent): string {
  return `/events/${event.id}`;
}

/** An event counts as "past" once its end (or start) has fully elapsed. */
function endOf(event: HostedEvent): Date {
  return event.data.endDate ?? event.data.startDate;
}

/**
 * Upcoming is derived from the date rather than stored, so events age out on
 * their own. Compared against the start of today so an event happening today
 * still counts as upcoming.
 */
export async function getUpcomingEvents(): Promise<HostedEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (await loadEvents())
    .filter((e) => endOf(e) >= today)
    .sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime());
}

export async function getPastEvents(): Promise<HostedEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (await loadEvents())
    .filter((e) => endOf(e) < today)
    .sort((a, b) => b.data.startDate.getTime() - a.data.startDate.getTime());
}

export async function getAllEvents(): Promise<HostedEvent[]> {
  return loadEvents();
}

export function isPast(event: HostedEvent): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return endOf(event) < today;
}

/** "18 Sep 2026" or "18–19 Sep 2026" for multi-day events. */
export function formatEventDate(event: HostedEvent): string {
  const { startDate, endDate } = event.data;
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

  if (!endDate || sameDay(startDate, endDate)) {
    return startDate.toLocaleDateString('en-GB', opts);
  }

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  return sameMonth
    ? `${startDate.getDate()}–${endDate.toLocaleDateString('en-GB', opts)}`
    : `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${endDate.toLocaleDateString('en-GB', opts)}`;
}

/** "6:00–8:00 PM IST", or just the start time when there is no end. */
export function formatEventTime(event: HostedEvent): string {
  const { startDate, endDate, timezone } = event.data;
  if (!hasTime(startDate)) return '';

  const t = (d: Date) => d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  const span = endDate && sameDay(startDate, endDate) ? `${t(startDate)}–${t(endDate)}` : t(startDate);
  return timezone ? `${span} ${timezone}` : span;
}

/** Compact date badge parts, e.g. { day: '18', month: 'SEP' }. */
export function dateBadge(event: HostedEvent) {
  const d = event.data.startDate;
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    year: d.getFullYear(),
  };
}

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** A date parsed from a date-only string lands exactly at local midnight. */
function hasTime(d: Date): boolean {
  return d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
}

/** schema.org Event nodes, so results can show date and location directly. */
export function eventSchema(events: HostedEvent[], siteUrl: string, personId: string) {
  return events.map((event) => ({
    '@type': 'Event',
    name: event.data.title,
    description: event.data.description,
    startDate: event.data.startDate.toISOString(),
    ...(event.data.endDate && { endDate: event.data.endDate.toISOString() }),
    eventAttendanceMode: event.data.online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: `${siteUrl}${eventUrl(event)}`,
    location: event.data.online
      ? { '@type': 'VirtualLocation', url: event.data.joinUrl ?? `${siteUrl}${eventUrl(event)}` }
      : {
          '@type': 'Place',
          name: event.data.venue ?? event.data.location,
          address: event.data.location,
        },
    organizer: event.data.host
      ? { '@type': 'Organization', name: event.data.host }
      : { '@id': personId },
    ...(event.data.price === 'Free' && {
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}${eventUrl(event)}`,
      },
    }),
  }));
}
