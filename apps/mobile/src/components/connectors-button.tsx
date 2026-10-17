import { Cable } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Border, Palette, Radius, Shadow } from '@/constants/theme';

/**
 * Connectors is a secondary screen, not one of the main destinations — the web
 * app reaches it from a compact icon-only button in the header, and this matches
 * that: a circular cable glyph beside the nav pills.
 *
 * It pushes onto the stack, so back returns you to whichever tab you came from.
 */
export function ConnectorsButton() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname === '/connect';

  return (
    <Pressable
      onPress={() => router.push('/connect')}
      accessibilityRole="button"
      accessibilityLabel="Connectors"
      accessibilityState={{ selected: active }}
      style={StyleSheet.flatten([styles.button, active && styles.buttonActive])}
    >
      <Cable size={18} strokeWidth={2.4} color={Palette.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper,
    shadowColor: Palette.ink,
    shadowOffset: { width: Shadow.sm, height: Shadow.sm },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.sm,
  },
  buttonActive: { backgroundColor: Palette.yolk },
});
