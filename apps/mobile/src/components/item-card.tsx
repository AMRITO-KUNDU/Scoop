import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { TypeBadge } from '@/components/type-badge';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import type { ConnectorId } from '@/lib/connectors';
import { formatWhen, type PlanItem } from '@/lib/plan';

const SYNCED_LABEL: Record<ConnectorId, string> = {
  googlecalendar: 'Calendar',
  googletasks: 'Tasks',
};

/** One item in the plan, with its actions and where it has been synced. */
export const ItemCard = memo(function ItemCard({
  item,
  busy,
  onToggleDone,
  onRemove,
}: {
  item: PlanItem;
  busy: boolean;
  onToggleDone: (item: PlanItem) => void;
  onRemove: (item: PlanItem) => void;
}) {
  return (
    <Panel style={styles.wrap}>
      <View style={styles.inner}>
        <TypeBadge type={item.type} />

        <Text style={item.done ? [styles.title, styles.titleDone] : styles.title}>{item.title}</Text>
        <Text style={styles.when}>{formatWhen(item)}</Text>

        {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}

        {item.syncedTo.length ? (
          <View style={styles.synced}>
            {item.syncedTo.map((id) => (
              <View key={id} style={styles.syncedChip}>
                <Text style={styles.syncedLabel}>{SYNCED_LABEL[id] ?? id}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={item.done ? 'Done' : 'Mark done'}
            variant={item.done ? 'yolk' : 'paper'}
            size="sm"
            disabled={busy}
            onPress={() => onToggleDone(item)}
            style={styles.action}
          />
          <Button
            label="Delete"
            variant="paper"
            size="sm"
            disabled={busy}
            onPress={() => onRemove(item)}
            style={styles.action}
          />
        </View>
      </View>
    </Panel>
  );
});


const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.three },
  inner: { padding: Spacing.three },
  title: { marginTop: Spacing.two, fontSize: 18, fontWeight: '700', color: Palette.ink },
  titleDone: { color: Palette.mute, textDecorationLine: 'line-through' },
  when: { marginTop: Spacing.one, fontSize: 13, fontWeight: '600', color: Palette.mute },
  meta: { marginTop: Spacing.one, fontSize: 13, color: Palette.mute },
  notes: { marginTop: Spacing.two, fontSize: 14, lineHeight: 20, color: Palette.ink },
  synced: { marginTop: Spacing.three, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  syncedChip: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.cyan,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  syncedLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Palette.ink,
  },
  actions: { marginTop: Spacing.three, flexDirection: 'row', gap: Spacing.two },
  action: { flex: 1 },
});
