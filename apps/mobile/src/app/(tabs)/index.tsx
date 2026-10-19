import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const params = useLocalSearchParams<{ filter?: string }>();

  // Start with an empty array so the list never collapses to null between refreshes.
  const [items, setItems] = useState<PlanItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PlanFilter>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Show the loading placeholder only on the very first load, not on every focus.
  const [initialLoading, setInitialLoading] = useState(true);
  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    if (params.filter === 'all' || params.filter === 'today' || params.filter === 'week') {
      setFilter(params.filter as PlanFilter);
    }
  }, [params.filter]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const next = await api.listPlan();
        setItems(next);
        setError(null);
      } catch (err) {
        // On a background refetch keep visible items — just surface the error banner.
        if (!opts?.silent) {
          setError(err instanceof Error ? err.message : 'Could not load your plan.');
        }
      } finally {
        if (!hasFetchedOnce.current) {
          hasFetchedOnce.current = true;
          setInitialLoading(false);
        }
      }
    },
    [api],
  );

  useFocusEffect(
    useCallback(() => {
      // Subsequent focuses load silently — existing items stay visible while
      // the request is in flight (stale-while-revalidate).
      void load({ silent: hasFetchedOnce.current });
    }, [load]),
  );

  const visible = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter],
  );

  const toggleDone = useCallback(
    async (item: PlanItem) => {
      setBusyId(item.id);
      try {
        await api.setDone(item.id, !item.done);
        // Optimistic local flip — avoids a round-trip re-render flash.
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, done: !row.done } : row)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update that item.');
        void load({ silent: true });
      } finally {
        setBusyId(null);
      }
    },
    [api, load],
  );

  const remove = useCallback(
    async (item: PlanItem) => {
      setBusyId(item.id);
      // Optimistic: drop immediately, restore on failure.
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      try {
        await api.remove(item.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not delete that item.');
        void load({ silent: true });
      } finally {
        setBusyId(null);
      }
    },
    [api, load],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load().finally(() => setRefreshing(false));
  }, [load]);

  return (
    <Screen
      sticker="Your plan"
      title="Everything in one place."
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.ink} />
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

      {initialLoading && !error ? (
        <EmptyState title="Loading your plan..." body="One moment." />
      ) : null}

      {!initialLoading && visible.length === 0 && !error ? (
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
          onToggleDone={toggleDone}
          onRemove={remove}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four },
  filter: { flex: 1 },
});
