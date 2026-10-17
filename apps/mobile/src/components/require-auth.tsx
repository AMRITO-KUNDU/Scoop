import { useAuth } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Wordmark } from '@/components/logo';
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Palette.ink} />
      </View>
    );
  }

  if (!isSignedIn) return <SignInPrompt />;

  return <>{children}</>;
}

/**
 * The mark centred, the two ways in at the bottom, and nothing else — the web's
 * auth panel is a wordmark above Clerk's form with no marketing copy, and this
 * keeps that restraint.
 *
 * The bottom actions sit in a SafeAreaView so they clear the home indicator.
 */
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
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.centre}>
        <Wordmark size={44} />
      </View>

      <View style={styles.actions}>
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
          disabled={busy}
          onPress={() => void signIn('sign-up')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paper,
  },
  safe: { flex: 1, backgroundColor: Palette.paper },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  error: { fontSize: 13, color: Palette.hot, fontWeight: '600', marginBottom: Spacing.one },
});
