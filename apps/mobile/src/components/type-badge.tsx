import { StyleSheet, Text, View } from 'react-native';

import { Border, Palette, Radius, TypeTone } from '@/constants/theme';
import { TYPE_LABEL, type ItemType } from '@/lib/plan';

/** Small pill showing an item's type, colour-coded like the web app. */
export function TypeBadge({ type }: { type: ItemType }) {
  const tone = TypeTone[type] ?? Palette.paper2;
  // Yolk is light, so it keeps ink text; the darker tones get paper text.
  const dark = type !== 'task';

  return (
    <View style={[styles.badge, { backgroundColor: tone }]}>
      <Text style={[styles.label, { color: dark ? Palette.paper : Palette.ink }]}>
        {TYPE_LABEL[type] ?? 'Item'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
});
