import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

/** The app's two main destinations. Connectors is a button, not a tab. */
const ITEMS = [
  { href: '/', label: 'Plan' },
  { href: '/capture', label: 'Capture' },
] as const;

/**
 * Switches between the two tab screens.
 *
 * `router.navigate` is the tab-switch call — it resolves to a jump, so it never
 * pushes a screen or replays a transition. (Note `navigate` no longer pops back
 * to an existing route in current Expo Router; it behaves like `push` on a
 * stack. That is why the main destinations are tabs, not stacked screens.)
 *
 * Navigation goes through the router rather than `<Link asChild>` because
 * Link's asChild renders its child through expo-router's Slot, which clones the
 * element and needs a flattened style object.
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
            onPress={() => router.navigate(item.href)}
            accessibilityRole="tab"
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
  row: { flexDirection: 'row', gap: Spacing.two },
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
