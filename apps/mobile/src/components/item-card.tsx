import { CalendarPlus, Check, Download, Trash2 } from 'lucide-react-native';
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

/**
 * One item in the plan, laid out as the web app lays it out: a row of actions —
 * mark done, and for anything with a date, open in Google Calendar or export an
 * .ics — with delete on its own line below.
 */
export function ItemCard({
  item,
  busy,
  onToggleDone,
  onOpenGoogle,
  onExportIcs,
  onRemove,
}: {
  item: PlanItem;
  busy: boolean;
  onToggleDone: () => void;
  onOpenGoogle: () => void;
  onExportIcs: () => void;
  onRemove: () => void;
}) {
  return (
    <Panel style={styles.wrap}>
      <View style={styles.inner}>
        <TypeBadge type={item.type} />

        <Text style={[styles.title, item.done && styles.titleDone]}>{item.title}</Text>
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
            icon={Check}
            variant={item.done ? 'yolk' : 'paper'}
            size="sm"
            disabled={busy}
            onPress={onToggleDone}
            style={styles.action}
          />
          {item.date ? (
            <>
              <Button
                label="Google"
                icon={CalendarPlus}
                variant="cyan"
                size="sm"
                disabled={busy}
                onPress={onOpenGoogle}
                style={styles.action}
              />
              <Button
                label=".ics"
                icon={Download}
                variant="paper"
                size="sm"
                disabled={busy}
                onPress={onExportIcs}
                style={styles.action}
              />
            </>
          ) : null}
        </View>

        <Button
          label="Delete"
          icon={Trash2}
          variant="paper"
          size="sm"
          disabled={busy}
          onPress={onRemove}
          style={styles.deleteRow}
        />
      </View>
    </Panel>
  );
}

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
  deleteRow: { marginTop: Spacing.two },
});
