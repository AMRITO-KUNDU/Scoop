import { Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TypeBadge } from '@/components/type-badge';
import { Field } from '@/components/ui/field';
import { Panel } from '@/components/ui/panel';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { ITEM_TYPES, TYPE_LABEL, type DraftItem, type ItemType } from '@/lib/plan';

/**
 * One extracted item, editable before it goes into the plan.
 *
 * Same fields the web app exposes, and the same compact icon-only remove button
 * beside the type badge — nothing is saved until the user confirms, so a wrong
 * date or a bad title is theirs to fix first.
 */
export function DraftCard({
  draft,
  onChange,
  onRemove,
}: {
  draft: DraftItem;
  onChange: (next: DraftItem) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof DraftItem>(key: K, value: DraftItem[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <Panel style={styles.wrap}>
      <View style={styles.inner}>
        <View style={styles.head}>
          <TypeBadge type={draft.type} />
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove item"
            style={styles.remove}
          >
            <Trash2 size={16} strokeWidth={2.4} color={Palette.ink} />
          </Pressable>
        </View>

        <View style={styles.chips}>
          {ITEM_TYPES.map((type) => {
            const active = draft.type === type;
            return (
              <Pressable
                key={type}
                onPress={() => set('type', type as ItemType)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {TYPE_LABEL[type]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Title" value={draft.title} onChangeText={(v) => set('title', v)} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Field
              label="Date"
              value={draft.date ?? ''}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              onChangeText={(v) => set('date', v.trim() ? v.trim() : null)}
            />
          </View>
          <View style={styles.half}>
            <Field
              label="Time"
              value={draft.time ?? ''}
              placeholder="HH:MM"
              autoCapitalize="none"
              onChangeText={(v) => set('time', v.trim() ? v.trim() : null)}
            />
          </View>
        </View>

        <Field
          label="Location"
          value={draft.location ?? ''}
          placeholder="Optional"
          onChangeText={(v) => set('location', v.trim() ? v.trim() : null)}
        />
        <Field
          label="Notes"
          value={draft.notes ?? ''}
          placeholder="Optional"
          onChangeText={(v) => set('notes', v.trim() ? v.trim() : null)}
        />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.three },
  inner: { padding: Spacing.three, gap: Spacing.three },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  remove: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.md,
    backgroundColor: Palette.paper,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one + 2 },
  chip: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Palette.paper2,
  },
  chipActive: { backgroundColor: Palette.ink },
  chipLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, color: Palette.ink },
  chipLabelActive: { color: Palette.paper },
  row: { flexDirection: 'row', gap: Spacing.two },
  half: { flex: 1 },
});
