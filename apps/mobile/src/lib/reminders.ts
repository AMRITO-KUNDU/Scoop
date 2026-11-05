/**
 * Local reminders for dated plan items.
 *
 * The phone schedules its own notifications: no server, no push service, no
 * account, works offline. One nudge per item, at 6pm the evening before — the
 * moment a parent can actually act on it.
 *
 * Worth knowing: this only knows what is on this device. An item added on the
 * web will not notify until the app next syncs. Server push is the fix for that,
 * and it only becomes necessary once plans are shared between two people.
 */
import * as Notifications from 'expo-notifications';

import type { PlanItem } from '@/lib/plan';

/** Evening before, local time. */
const NUDGE_HOUR = 18;

/** iOS keeps at most 64 pending notifications; stay well under it. */
const MAX_SCHEDULED = 20;

const ID_PREFIX = 'scoop-item-';

// Without this, a notification arriving while the app is open is swallowed.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function hasReminderPermission(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return Boolean(settings.granted);
  } catch {
    return false;
  }
}

/**
 * Ask for permission — but only when we are about to use it.
 *
 * Called the first time a plan has a dated item, never at launch: a permission
 * prompt before the user has anything to be reminded about gets denied, and a
 * denial is hard to come back from.
 */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    if (!settings.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return Boolean(asked.granted);
  } catch {
    return false;
  }
}

/** The moment to nudge about `item`, or null when it is not worth one. */
function fireDateFor(item: PlanItem, now: Date): Date | null {
  if (!item.date || item.done) return null;

  const day = new Date(`${item.date}T00:00:00`);
  if (Number.isNaN(day.getTime())) return null;

  const eveningBefore = new Date(day);
  eveningBefore.setDate(eveningBefore.getDate() - 1);
  eveningBefore.setHours(NUDGE_HOUR, 0, 0, 0);
  if (eveningBefore.getTime() > now.getTime()) return eveningBefore;

  // That slot has passed. If the thing is today, a nudge this evening is still
  // useful; otherwise the moment has gone and a late ping is just noise.
  const sameDay = day.toDateString() === now.toDateString();
  const thisEvening = new Date(now);
  thisEvening.setHours(NUDGE_HOUR, 0, 0, 0);
  if (sameDay && thisEvening.getTime() > now.getTime()) return thisEvening;

  return null;
}

function bodyFor(item: PlanItem): string {
  const when = new Date(`${item.date}T00:00:00`);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const label = when.toDateString() === today.toDateString()
    ? 'Today'
    : when.toDateString() === tomorrow.toDateString()
      ? 'Tomorrow'
      : when.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const parts = [item.time ? `${label}, ${item.time}` : label];
  if (item.location) parts.push(item.location);
  if (item.notes) parts.push(item.notes);

  return parts.join(' · ');
}

/**
 * Make the phone's pending reminders match the plan.
 *
 * The plan is the source of truth, so everything we scheduled before is cleared
 * and the nearest few dated, unfinished items are scheduled again. Cheap enough
 * to run on every load.
 */
export async function syncReminders(items: PlanItem[]): Promise<void> {
  if (!(await hasReminderPermission())) return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((request) => request.identifier.startsWith(ID_PREFIX))
        .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
    );

    const now = new Date();
    const upcoming = items
      .map((item) => ({ item, at: fireDateFor(item, now) }))
      .filter((entry): entry is { item: PlanItem; at: Date } => entry.at !== null)
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .slice(0, MAX_SCHEDULED);

    for (const { item, at } of upcoming) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${ID_PREFIX}${item.id}`,
        content: {
          title: item.title,
          body: bodyFor(item),
          data: { itemId: item.id },
        },
        trigger: { type: 'date', date: at } as Notifications.NotificationTriggerInput,
      });
    }
  } catch (err) {
    // A reminder is a nice-to-have: never let it break the plan screen.
    console.error('[reminders] could not sync:', err);
  }
}
