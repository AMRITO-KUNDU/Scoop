import { CalendarDays, ScanText, type LucideIcon } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

/** Same two destinations, and the same order, as the web app's nav. */
const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/capture', label: 'Capture', icon: ScanText },
  { href: '/', label: 'Plan', icon: CalendarDays },
];

/**
 * The main destinations, as the web app's segmented pill group: one bordered
 * container, an icon-and-label pill per tab, active pill in yolk.
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
    <View style={styles.group}>
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
            <item.icon size={16} strokeWidth={2.4} color={Palette.ink} />
            <Text style={styles.label}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper,
    padding: 3,
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemActive: { backgroundColor: Palette.yolk },
  label: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, color: Palette.ink },
});
