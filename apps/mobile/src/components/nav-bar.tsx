import { usePathname, useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

/** The app's two main destinations. Connectors is a button, not a tab. */
const ITEMS = [
  { href: '/', label: 'Plan' },
  { href: '/capture', label: 'Capture' },
] as const;

type Href = (typeof ITEMS)[number]['href'];

/** A single nav pill, memoised so it only re-renders when its active state changes. */
const NavItem = memo(function NavItem({
  href,
  label,
  active,
  onPress,
}: {
  href: Href;
  label: string;
  active: boolean;
  onPress: (href: Href) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(href)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={active ? [styles.item, styles.itemActive] : styles.item}
    >
      <Text style={active ? [styles.label, styles.labelActive] : styles.label}>{label}</Text>
    </Pressable>
  );
});

/**
 * Switches between the two tab screens.
 *
 * Wrapped in memo — the header renders on every scroll event via the parent
 * ScrollView's sticky header logic; memoising avoids re-computing pathname
 * comparisons and re-creating Pressable children on unrelated parent re-renders.
 */
export const NavBar = memo(function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handlePress = useCallback((href: Href) => router.navigate(href), [router]);

  return (
    <View style={styles.row}>
      {ITEMS.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          active={pathname === item.href}
          onPress={handlePress}
        />
      ))}
    </View>
  );
});

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
