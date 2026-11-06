import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { DraftCard } from '@/components/draft-card';
import { EmptyState } from '@/components/empty-state';
import { ItemCard } from '@/components/item-card';
import { RequireAuth } from '@/components/require-auth';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';
import {
  deviceTimezone,
  matchesFilter,
  type DraftItem,
  type PlanFilter,
  type PlanItem,
} from '@/lib/plan';

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<DraftItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<DraftItem | null>(null);
  const [savingNew, setSavingNew] = useState(false);
  const [undoItem, setUndoItem] = useState<PlanItem | null>(null);
  const [query, setQuery] = useState('');
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!matchesFilter(item, filter)) return false;
      if (!q) return true;
      return [item.title, item.location ?? '', item.notes ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, filter, query]);

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

  const startAdd = useCallback(() => {
    setNewDraft({
      key: 'new',
      type: 'task',
      title: '',
      date: null,
      time: null,
      location: null,
      notes: null,
    });
    setAdding(true);
  }, []);

  const cancelAdd = useCallback(() => {
    setAdding(false);
    setNewDraft(null);
  }, []);

  /** A plan is not only what other people send you. */
  const saveNew = useCallback(async () => {
    if (!newDraft) return;
    if (!newDraft.title.trim()) {
      setError('An item needs a title.');
      return;
    }
    const { key: _key, ...fields } = newDraft;
    setSavingNew(true);
    try {
      await api.addItems([fields], deviceTimezone());
      cancelAdd();
      await load({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that item.');
    } finally {
      setSavingNew(false);
    }
  }, [api, cancelAdd, load, newDraft]);

  const startEdit = useCallback((item: PlanItem) => {
    setEditingId(item.id);
    setEditDraft({
      key: String(item.id),
      type: item.type,
      title: item.title,
      date: item.date,
      time: item.time,
      location: item.location,
      notes: item.notes,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editDraft || editingId === null) return;
    if (!editDraft.title.trim()) {
      setError('An item needs a title.');
      return;
    }
    const { key: _key, ...fields } = editDraft;
    setSavingEdit(true);
    try {
      await api.updateItem(editingId, fields, deviceTimezone());
      setItems((prev) => prev.map((row) => (row.id === editingId ? { ...row, ...fields } : row)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that change.');
    } finally {
      setSavingEdit(false);
    }
  }, [api, cancelEdit, editDraft, editingId]);

  /** Deleting is one tap and permanent, so offer it back. The item is re-created. */
  const restore = useCallback(
    async (item: PlanItem) => {
      setUndoItem(null);
      try {
        await api.addItems(
          [
            {
              type: item.type,
              title: item.title,
              date: item.date,
              time: item.time,
              location: item.location,
              notes: item.notes,
            },
          ],
          deviceTimezone(),
        );
        void load({ silent: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not restore that item.');
      }
    },
    [api, load],
  );

  const remove = useCallback(
    async (item: PlanItem) => {
      setBusyId(item.id);
      // Optimistic: drop immediately, restore on failure.
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      if (editingId === item.id) cancelEdit();
      try {
        await api.remove(item.id);
        setUndoItem(item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not delete that item.');
        void load({ silent: true });
      } finally {
        setBusyId(null);
      }
    },
    [api, cancelEdit, editingId, load],
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
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search your plan…"
        placeholderTextColor={Palette.mute}
        accessibilityLabel="Search your plan"
        autoCorrect={false}
        style={styles.search}
      />

      {adding && newDraft ? (
        <View style={styles.editWrap}>
          <DraftCard draft={newDraft} onChange={setNewDraft} />
          <View style={styles.editActions}>
            <Button
              label={savingNew ? 'Adding…' : 'Add to plan'}
              variant="ink"
              size="sm"
              disabled={savingNew}
              onPress={() => void saveNew()}
              style={styles.editAction}
            />
            <Button
              label="Cancel"
              variant="paper"
              size="sm"
              onPress={cancelAdd}
              style={styles.editAction}
            />
          </View>
        </View>
      ) : (
        <View style={styles.addRow}>
          <Button label="+ Add an item" variant="paper" size="sm" onPress={startAdd} />
        </View>
      )}

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

      {undoItem ? (
        <View style={styles.undoBar}>
          <Text style={styles.undoText} numberOfLines={1}>
            Deleted “{undoItem.title}”
          </Text>
          <Button
            label="Undo"
            variant="paper"
            size="sm"
            onPress={() => void restore(undoItem)}
          />
        </View>
      ) : null}

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

      {visible.map((item) =>
        editingId === item.id && editDraft ? (
          <View key={item.id} style={styles.editWrap}>
            <DraftCard draft={editDraft} onChange={setEditDraft} />
            <View style={styles.editActions}>
              <Button
                label={savingEdit ? 'Saving…' : 'Save changes'}
                variant="ink"
                size="sm"
                disabled={savingEdit}
                onPress={() => void saveEdit()}
                style={styles.editAction}
              />
              <Button
                label="Cancel"
                variant="paper"
                size="sm"
                onPress={cancelEdit}
                style={styles.editAction}
              />
            </View>
          </View>
        ) : (
          <Swipeable
            key={item.id}
            overshootRight={false}
            renderRightActions={() => (
              <Pressable
                onPress={() => void remove(item)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.title}`}
                style={styles.swipeDelete}
              >
                <Text style={styles.swipeDeleteLabel}>Delete</Text>
              </Pressable>
            )}
          >
            <ItemCard
              item={item}
              busy={busyId === item.id}
              onToggleDone={toggleDone}
              onRemove={remove}
              onEdit={startEdit}
            />
          </Swipeable>
        ),
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { marginTop: Spacing.four, flexDirection: 'row' },
  search: {
    marginTop: Spacing.four,
    height: 44,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontWeight: '600',
    color: Palette.ink,
  },
  swipeDelete: {
    marginTop: Spacing.three,
    marginLeft: Spacing.two,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.lg,
    backgroundColor: Palette.hot,
  },
  swipeDeleteLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.paper,
  },
  filters: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four },
  filter: { flex: 1 },
  undoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.lg,
    backgroundColor: Palette.paper2,
  },
  undoText: { flex: 1, fontSize: 13, fontWeight: '600', color: Palette.ink },
  editWrap: { marginTop: Spacing.three },
  editActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  editAction: { flex: 1 },
});
