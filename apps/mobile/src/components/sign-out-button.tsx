import { LogOut } from 'lucide-react-native';
import { useAuth } from '@clerk/expo';
import { Pressable, StyleSheet } from 'react-native';

import { Border, Palette, Radius, Shadow } from '@/constants/theme';

/**
 * Sits where the web app's Clerk avatar sits, at the right of the header.
 *
 * A plain sign-out rather than a full account menu: the web's avatar opens
 * Clerk's account management, which on mobile would need the native components
 * package and a development build. Signing out is the part that actually
 * matters day to day.
 */
export function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <Pressable
      onPress={() => void signOut()}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      style={styles.button}
    >
      <LogOut size={18} strokeWidth={2.4} color={Palette.ink} />
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
});
