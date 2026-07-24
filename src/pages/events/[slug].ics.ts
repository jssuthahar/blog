import type { APIRoute } from 'astro';
import { SITE } from '../../config';
import { eventUrl, getAllEvents, type HostedEvent } from '../../lib/eventhub';

export async function getStaticPaths() {
  const events = await getAllEvents();
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
}

/** Wall-clock "floating" time (YYYYMMDDTHHMMSS) as the event was authored. */
function floating(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `T${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

/** UTC stamp for DTSTAMP, which must be an absolute time. */
function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape per RFC 5545: commas, semicolons, backslashes, and newlines. */
function esc(s: string): string {
  return s.replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n');
}

export const GET: APIRoute = ({ props }) => {
  const event = props.event as HostedEvent;
  const { data } = event;

  const url = `${SITE.url}${eventUrl(event)}`;
  const end = data.endDate ?? new Date(data.startDate.getTime() + 60 * 60 * 1000);
  const location = data.online
    ? data.joinUrl ?? 'Online'
    : data.venue
      ? `${data.venue}, ${data.location}`
      : data.location;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${esc(SITE.title)}//Events//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@${new URL(SITE.url).host}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${floating(data.startDate)}`,
    `DTEND:${floating(end)}`,
    `SUMMARY:${esc(data.title)}`,
    `DESCRIPTION:${esc(`${data.description}\n\n${url}`)}`,
    `LOCATION:${esc(location)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  // RFC 5545 wants CRLF line endings.
  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.id}.ics"`,
    },
  });
};
