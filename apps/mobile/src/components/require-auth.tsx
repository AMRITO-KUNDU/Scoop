import { useAuth } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaviconLogo } from '@/components/favicon-logo';
import { Button } from '@/components/ui/button';
import { Palette, Spacing } from '@/constants/theme';

/**
 * Gates a screen on being signed in.
 *
 * Deliberately not a router redirect: rendering the prompt in place avoids
 * depending on navigation timing, and means every screen is safe to open
 * directly (a deep link, a cold start on any tab).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.loadingCentre}>
        <ActivityIndicator size="large" color={Palette.ink} />
      </View>
    );
  }

  if (!isSignedIn) return <SignInPrompt />;

  return <>{children}</>;
}

function SignInPrompt() {
  const { startHostedAuth } = useHostedAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(mode: 'sign-in' | 'sign-up') {
    setBusy(true);
    setError(null);
    try {
      await startHostedAuth({ mode });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.centre}>
        <FaviconLogo size={140} />
      </View>

      <View style={styles.bottom}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Sign in"
          variant="yolk"
          size="lg"
          loading={busy}
          onPress={() => void signIn('sign-in')}
        />
        <Button
          label="Create an account"
          variant="paper"
          size="lg"
          disabled={busy}
          onPress={() => void signIn('sign-up')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingCentre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.paper,
  },
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  centre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: Spacing.two,
  },
  error: {
    marginBottom: Spacing.two,
    textAlign: 'center',
    fontSize: 13,
    color: Palette.hot,
    fontWeight: '600',
  },
});
