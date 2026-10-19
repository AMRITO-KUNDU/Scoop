import { usePathname, useRouter } from 'expo-router';
import { Cable } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Border, Palette, Radius } from '@/constants/theme';

/**
 * Connectors is a secondary screen, not one of the main destinations — the same
 * way the web app reaches it from a small button rather than the main nav. It
 * sits at the right of the header and pushes onto the stack, so back returns
 * you to whichever tab you came from.
 *
 * Memoised: re-renders only when the active path changes.
 */
export const ConnectorsButton = memo(function ConnectorsButton() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname === '/connect';

  const handlePress = useCallback(() => router.push('/connect'), [router]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Connectors"
      accessibilityState={{ selected: active }}
      style={active ? [styles.button, styles.buttonActive] : styles.button}
    >
      <Cable size={13} color={Palette.paper} strokeWidth={2.4} />
      <Text style={active ? [styles.label, styles.labelActive] : styles.label}>Connectors</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 3,
    borderColor: Palette.ink,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Palette.grape,
  },
  buttonActive: { backgroundColor: Palette.ink },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, color: Palette.paper },
  labelActive: { color: Palette.paper },
});

