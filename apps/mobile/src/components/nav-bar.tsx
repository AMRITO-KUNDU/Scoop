import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

const ITEMS = [
  { href: '/', label: 'Plan' },
  { href: '/capture', label: 'Capture' },
  { href: '/connect', label: 'Connectors' },
] as const;

/** Three-way nav shown at the top of every screen. */
export function NavBar() {
  const pathname = usePathname();

  return (
    <View style={styles.row}>
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
              style={[styles.item, active && styles.itemActive]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  item: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Palette.paper2,
  },
  itemActive: { backgroundColor: Palette.ink },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, color: Palette.ink },
  labelActive: { color: Palette.paper },
});
