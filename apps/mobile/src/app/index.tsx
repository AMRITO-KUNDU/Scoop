import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ItemCard } from '@/components/item-card';
import { RequireAuth } from '@/components/require-auth';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Palette, Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { matchesFilter, type PlanFilter, type PlanItem } from '@/lib/plan';

const FILTERS: { id: PlanFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
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

  useEffect(() => {
    void load();
  }, [load]);

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
      setError(err instanceof Error ? err.message : 'Could not update that item.');
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
      setError(err instanceof Error ? err.message : 'Could not delete that item.');
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen
      sticker="Your plan"
      title="Everything in one place."
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
          const active = filter === f.id;
          return (
            <Button
              key={f.id}
              label={f.label}
              size="sm"
              variant={active ? 'ink' : 'paper'}
              onPress={() => setFilter(f.id)}
              style={styles.filter}
            />
          );
        })}
      </View>

      {error ? <EmptyState title="Something went wrong" body={error} /> : null}

      {items === null && !error ? (
        <EmptyState title="Loading your plan…" body="One moment." />
      ) : null}

      {items !== null && visible.length === 0 && !error ? (
        <EmptyState
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
              onPress={() => router.push('/capture')}
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
          onRemove={() => void remove(item)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four },
  filter: { flex: 1 },
});
