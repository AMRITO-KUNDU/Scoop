import { useAuth } from '@clerk/expo';
import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
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
      <Panel style={styles.card}>
        <View style={styles.inner}>
          <Text style={styles.title}>Sign in to SCOOP</Text>
          <Text style={styles.body}>
            Your plan is tied to your account, so it's there when you come back — on this phone or
            on the web.
          </Text>

          <View style={styles.actions}>
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

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, justifyContent: 'center', padding: Spacing.four, backgroundColor: Palette.paper },
  card: { alignSelf: 'stretch', maxWidth: 460, width: '100%', marginHorizontal: 'auto' },
  inner: { padding: Spacing.four },
  title: { fontSize: 24, fontWeight: '900', color: Palette.ink, textTransform: 'uppercase' },
  body: { marginTop: Spacing.two, fontSize: 14, lineHeight: 20, color: Palette.mute },
  actions: { marginTop: Spacing.four, gap: Spacing.two },
  error: { marginTop: Spacing.three, fontSize: 13, color: Palette.hot, fontWeight: '600' },
});
