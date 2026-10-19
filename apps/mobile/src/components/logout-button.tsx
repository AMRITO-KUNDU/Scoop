import { useAuth } from '@clerk/expo';
import { LogOut } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';

export const LogoutButton = memo(function LogoutButton() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert('Log out', 'Are you sure you want to log out of SCOOP?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await signOut();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not log out.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }, [signOut]);

  return (
    <IconButton
      icon={LogOut}
      onPress={handleLogout}
      accessibilityLabel="Log out"
      variant="paper"
      loading={busy}
    />
  );
});
