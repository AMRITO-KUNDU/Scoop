import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

const ITEMS = [
  { href: '/', label: 'Plan' },
  { href: '/capture', label: 'Capture' },
  { href: '/connect', label: 'Connectors' },
] as const;

/**
 * Three-way nav shown at the top of every screen.
 *
 * Navigates with `useRouter().push` rather than `<Link asChild>`. Link's asChild
 * renders the child through expo-router's Slot, which clones the element and
 * needs a flattened style object — it raises a render error when the child's
 * `style` is an array, which is the idiomatic React Native form. Using the
 * router directly keeps the child a plain Pressable and sidesteps the clone.
 */
export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.row}>
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            accessibilityRole="link"
            accessibilityState={{ selected: active }}
            style={StyleSheet.flatten([styles.item, active && styles.itemActive])}
          >
            <Text style={StyleSheet.flatten([styles.label, active && styles.labelActive])}>
              {item.label}
            </Text>
          </Pressable>
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
