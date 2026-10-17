import { useAuth } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={Palette.ink} />
      </View>
    );
  }

  if (!isSignedIn) return <SignInPrompt />;

  return <>{children}</>;
}

/**
 * The logo, then the two ways in — the same shape as the web app's auth panel,
 * which is a wordmark above Clerk's form and nothing else. No marketing copy.
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
    <View style={styles.centre}>
      <Wordmark size={44} />

      <View style={styles.actions}>
        <Button
          label="Sign in"
          variant="yolk"
          size="lg"
          loading={busy}
          onPress={() => void signIn('sign-in')}
          style={styles.button}
        />
        <Button
          label="Create an account"
          variant="paper"
          disabled={busy}
          onPress={() => void signIn('sign-up')}
          style={styles.button}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: Palette.paper,
  },
  actions: { marginTop: Spacing.five, gap: Spacing.two, alignSelf: 'stretch', maxWidth: 380, width: '100%' },
  button: { alignSelf: 'stretch' },
  error: { marginTop: Spacing.three, fontSize: 13, color: Palette.hot, fontWeight: '600' },
});
