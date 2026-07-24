import { getCollection, type CollectionEntry } from 'astro:content';

export type SpeakingEvent = CollectionEntry<'speaking'>;

export const FORMAT_LABELS = {
  conference: 'Conference',
  webinar: 'Webinar',
  session: 'Session',
  meetup: 'Meetup',
  podcast: 'Podcast',
  community: 'Community event',
} as const;

async function loadEvents(): Promise<SpeakingEvent[]> {
  // The template file must never render as a real event.
  return (await getCollection('speaking')).filter((e) => e.id.toLowerCase() !== 'readme');
}

/**
 * Upcoming is derived from the date rather than stored, so events age out on
 * their own. Compared against the start of today so an event happening today
 * still counts as upcoming.
 */
export async function getUpcomingEvents(): Promise<SpeakingEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (await loadEvents())
    .filter((e) => (e.data.endDate ?? e.data.date) >= today)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getPastEvents(): Promise<SpeakingEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (await loadEvents())
    .filter((e) => (e.data.endDate ?? e.data.date) < today)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** "18 Sep 2026" or "18–19 Sep 2026" for multi-day events. */
export function formatEventDate(event: SpeakingEvent): string {
  const { date, endDate } = event.data;
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

  if (!endDate || endDate.getTime() === date.getTime()) {
    return date.toLocaleDateString('en-GB', opts);
  }

  const sameMonth =
    date.getMonth() === endDate.getMonth() && date.getFullYear() === endDate.getFullYear();

  return sameMonth
    ? `${date.getDate()}–${endDate.toLocaleDateString('en-GB', opts)}`
    : `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${endDate.toLocaleDateString('en-GB', opts)}`;
}

/** Compact date badge parts, e.g. { day: '18', month: 'SEP' }. */
export function dateBadge(event: SpeakingEvent) {
  return {
    day: String(event.data.date.getDate()).padStart(2, '0'),
    month: event.data.date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    year: event.data.date.getFullYear(),
  };
}

/** schema.org Event nodes, so results can show date and location directly. */
export function eventSchema(events: SpeakingEvent[], siteUrl: string, personId: string) {
  return events.map((event) => ({
    '@type': 'Event',
    name: event.data.talk ?? event.data.title,
    startDate: event.data.date.toISOString(),
    ...(event.data.endDate && { endDate: event.data.endDate.toISOString() }),
    eventAttendanceMode: event.data.online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: event.data.online
      ? { '@type': 'VirtualLocation', url: event.data.url ?? siteUrl }
      : {
          '@type': 'Place',
          name: event.data.venue ?? event.data.location,
          address: event.data.location,
        },
    performer: { '@id': personId },
    organizer: event.data.venue ? { '@type': 'Organization', name: event.data.venue } : undefined,
    ...(event.data.url && { url: event.data.url }),
  }));
}
