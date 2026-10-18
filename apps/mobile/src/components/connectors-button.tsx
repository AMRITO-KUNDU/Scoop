import { usePathname, useRouter } from 'expo-router';
import { Cable } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

/**
 * Connectors is a secondary screen, not one of the main destinations — the same
 * way the web app reaches it from a small button rather than the main nav. It
 * sits at the right of the header and pushes onto the stack, so back returns
 * you to whichever tab you came from.
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
      <Cable size={13} color={Palette.paper} strokeWidth={2.4} />
      <Text style={StyleSheet.flatten([styles.label, active && styles.labelActive])}>
        Connectors
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Palette.grape,
  },
  buttonActive: { backgroundColor: Palette.ink },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, color: Palette.paper },
  labelActive: { color: Palette.paper },
});
