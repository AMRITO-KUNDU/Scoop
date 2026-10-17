import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CalendarDays } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ItemCard } from '@/components/item-card';
import { RequireAuth } from '@/components/require-auth';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Border, Palette, Radius, Shadow, Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { googleCalendarUrl, icsFileName, toIcs } from '@/lib/calendar';
import { matchesFilter, type PlanFilter, type PlanItem } from '@/lib/plan';

const FILTERS: { id: PlanFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'all', label: 'All' },
];

export default function PlanScreen() {
  return (
    <RequireAuth>
      <Plan />
    </RequireAuth>
  );
}

function Plan() {
  const api = useApi();
  const router = useRouter();
  const [items, setItems] = useState<PlanItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PlanFilter>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api.listPlan());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your plan.');
    }
  }, [api]);

  /**
   * Refetch whenever the tab is focused, not just on mount.
   *
   * Tabs stay mounted, so a screen that only loaded once would keep showing a
   * stale list after items were added on the Capture tab — the list looked
   * wrong until you pulled to refresh.
   */
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const visible = useMemo(
    () => (items ?? []).filter((item) => matchesFilter(item, filter)),
    [items, filter],
  );

  async function toggleDone(item: PlanItem) {
    setBusyId(item.id);
    try {
      await api.setDone(item.id, !item.done);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t update that item.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: PlanItem) {
    setBusyId(item.id);
    // Optimistic: drop it now, put it back if the server disagrees.
    setItems((prev) => (prev ?? []).filter((row) => row.id !== item.id));
    try {
      await api.remove(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t delete that item.');
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function openGoogle(item: PlanItem) {
    const url = googleCalendarUrl(item);
    if (url) await Linking.openURL(url).catch(() => setError('Couldn’t open Google Calendar.'));
  }

  /** Write the event to a file and hand it to the share sheet. */
  async function exportIcs(item: PlanItem) {
    setBusyId(item.id);
    try {
      const ics = toIcs(item);
      if (!ics) return;
      const file = new File(Paths.cache, icsFileName(item));
      try {
        file.create();
      } catch {
        // Already there from a previous export; write() overwrites it.
      }
      await file.write(ics);

      if (!(await Sharing.isAvailableAsync())) {
        setError('Sharing isn’t available on this device.');
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/calendar',
        UTI: 'public.calendar-event',
        dialogTitle: 'Add to your calendar',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t export that item.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen
      sticker="Plan"
      title="Your plan."
      subtitle="What’s on — today, this week, or everything. Push dated items to Google Calendar."
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load().finally(() => setRefreshing(false));
          }}
          tintColor={Palette.ink}
        />
      }
    >
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={StyleSheet.flatten([styles.filter, on && styles.filterOn])}
            >
              <Text style={styles.filterLabel}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <EmptyState title="Could not load your plan" body={error} /> : null}

      {items === null && !error ? (
        <EmptyState title="Loading your plan…" body="One moment." />
      ) : null}

      {items !== null && visible.length === 0 && !error ? (
        <EmptyState
          icon={CalendarDays}
          title={items.length ? 'Nothing in this view' : 'Your plan is empty'}
          body={
            items.length
              ? 'Try another filter, or capture a new message.'
              : 'Dump a school message and add the bits that matter.'
          }
          action={
            <Button
              label="Go to Capture"
              variant="yolk"
              onPress={() => router.navigate('/capture')}
            />
          }
        />
      ) : null}

      {visible.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          busy={busyId === item.id}
          onToggleDone={() => void toggleDone(item)}
          onOpenGoogle={() => void openGoogle(item)}
          onExportIcs={() => void exportIcs(item)}
          onRemove={() => void remove(item)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginTop: Spacing.four,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper,
    padding: 3,
    gap: 2,
    shadowColor: Palette.ink,
    shadowOffset: { width: Shadow.sm, height: Shadow.sm },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.sm,
  },
  filter: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  filterOn: { backgroundColor: Palette.cyan },
  filterLabel: { fontSize: 14, fontWeight: '800', color: Palette.ink },
});
