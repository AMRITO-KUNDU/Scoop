/**
 * Calendar helpers — the mobile counterpart of the web app's `src/lib/calendar.ts`.
 * Same output strings, so a Google link or an .ics file produced here is
 * identical to one produced there.
 */

import type { ExtractedItem } from '@/lib/plan';

type CalendarItem = Pick<ExtractedItem, 'title' | 'date' | 'time' | 'location' | 'notes'> & {
  id?: number;
  type?: ExtractedItem['type'];
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function compactDate(date: string): string {
  return date.replace(/-/g, '');
}

function compactDateTime(date: string, time: string): string {
  return `${compactDate(date)}T${time.replace(':', '')}00`;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [hours, mins] = time.split(':').map(Number);
  const d = new Date(`${date}T${pad(hours)}:${pad(mins)}:00`);
  d.setMinutes(d.getMinutes() + minutes);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function slug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'item'
  );
}

/** RFC 5545: content lines fold at 75 octets, continuations start with a space. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest) parts.push(` ${rest}`);
  return parts.join('\r\n');
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/** The Google Calendar template link the web app opens in a new tab. */
export function googleCalendarUrl(item: CalendarItem): string | null {
  if (!item.date) return null;
  const params = new URLSearchParams({ action: 'TEMPLATE', text: item.title });

  if (item.time) {
    const end = addMinutes(item.date, item.time, 60);
    params.set(
      'dates',
      `${compactDateTime(item.date, item.time)}/${compactDateTime(end.date, end.time)}`,
    );
  } else {
    params.set('dates', `${compactDate(item.date)}/${compactDate(addDays(item.date, 1))}`);
  }

  if (item.location) params.set('location', item.location);
  const details = [item.notes, item.type ? `From SCOOP · ${item.type}` : null]
    .filter(Boolean)
    .join('\n');
  if (details) params.set('details', details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function toIcs(item: CalendarItem, now = new Date()): string | null {
  if (!item.date) return null;
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  const uid = item.id
    ? `scoop-item-${item.id}@scoop.app`
    : `scoop-draft-${compactDate(item.date)}-${slug(item.title)}@scoop.app`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SCOOP//School Life//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
  ];

  if (item.time) {
    const end = addMinutes(item.date, item.time, 60);
    lines.push(`DTSTART:${compactDateTime(item.date, item.time)}`);
    lines.push(`DTEND:${compactDateTime(end.date, end.time)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(item.date)}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(item.date, 1))}`);
  }

  lines.push(`SUMMARY:${escapeIcs(item.title)}`);
  if (item.location) lines.push(`LOCATION:${escapeIcs(item.location)}`);
  if (item.notes) lines.push(`DESCRIPTION:${escapeIcs(item.notes)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

export function icsFileName(item: CalendarItem): string {
  return `${slug(item.title)}.ics`;
}
