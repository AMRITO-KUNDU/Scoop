import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/theme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Root layout.
 *
 * Two layers: the `(tabs)` group holds the main destinations (Plan, Capture) so
 * they stay mounted and switch instantly, and `connect` is a single screen
 * pushed on top of them from the header button.
 *
 * `publishableKey` must be passed explicitly — environment variables inside
 * node_modules are not inlined in production React Native builds — and
 * `tokenCache` persists the session to expo-secure-store, without which the user
 * is signed out on every cold start.
 */
export default function RootLayout() {
  if (!publishableKey) return <MissingKey />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.paper },
        }}
      >
        {/* No transition between tabs — they're peers, not a drill-down. */}
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        {/* Normal platform transition for drill-down pages. */}
        <Stack.Screen name="connect" options={{ animation: 'default' }} />
      </Stack>
    </ClerkProvider>
  );
}

/** Better than a crash: says exactly what to set. */
function MissingKey() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        <Text style={styles.title}>Almost there</Text>
        <Text style={styles.body}>
          Add your Clerk publishable key to a .env file in apps/mobile and restart:
        </Text>
        <Text style={styles.code}>EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  inner: { flex: 1, justifyContent: 'center', padding: Spacing.four },
  title: { fontSize: 26, fontWeight: '900', color: Palette.ink, textTransform: 'uppercase' },
  body: { marginTop: Spacing.two, fontSize: 14, lineHeight: 20, color: Palette.mute },
  code: {
    marginTop: Spacing.three,
    fontFamily: 'monospace',
    fontSize: 12,
    color: Palette.ink,
    backgroundColor: Palette.paper2,
    padding: Spacing.three,
    borderRadius: 8,
  },
});
