/**
 * Plan types and formatting — the mobile counterpart of the web app's
 * `src/lib/plan.ts`. Same rules, same output strings, so a date reads the same
 * in both apps.
 */

import { format, isToday, isThisWeek, parseISO, isValid } from 'date-fns';

import type { ConnectorId } from '@/lib/connectors';

export const ITEM_TYPES = ['event', 'deadline', 'task', 'rsvp'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export type ExtractedItem = {
  type: ItemType;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  notes: string | null;
};

export type DraftItem = ExtractedItem & { key: string };

export type PlanItem = ExtractedItem & {
  id: number;
  done: boolean;
  createdAt: string;
  /** Connectors this item has already been pushed to. */
  syncedTo: ConnectorId[];
};

export const TYPE_LABEL: Record<ItemType, string> = {
  event: 'Event',
  deadline: 'Deadline',
  task: 'Task',
  rsvp: 'RSVP',
};

export function isItemType(value: string): value is ItemType {
  return (ITEM_TYPES as readonly string[]).includes(value);
}

export function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function formatDate(value: string | null): string {
  const d = parseDate(value);
  if (!d) return 'No date';
  return format(d, 'EEE d MMM');
}

export function formatTime(value: string | null): string {
  if (!value) return '';
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'pm' : 'am';
  const h12 = hours % 12 || 12;
  return minutes === '00' ? `${h12}${suffix}` : `${h12}:${minutes}${suffix}`;
}

export function formatWhen(item: Pick<ExtractedItem, 'date' | 'time'>): string {
  const date = formatDate(item.date);
  const time = formatTime(item.time);
  if (date === 'No date' && !time) return 'No date set';
  if (date === 'No date') return time;
  return time ? `${date} · ${time}` : date;
}

export type PlanFilter = 'today' | 'week' | 'all';

export function matchesFilter(item: PlanItem, filter: PlanFilter): boolean {
  if (filter === 'all') return true;
  const d = parseDate(item.date);
  if (!d) return false;
  if (filter === 'today') return isToday(d);
  return isThisWeek(d, { weekStartsOn: 1 });
}

/** The IANA zone the device is in — sent with writes so calendar sync is right. */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
