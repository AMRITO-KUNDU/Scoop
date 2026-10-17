import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplashOverlay } from '@/components/splash-overlay';
import { Palette, Spacing } from '@/constants/theme';
import { isContentReady, subscribeContentReady } from '@/lib/boot';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** How long the mark is shown at minimum, so a fast start doesn't blink. */
const MIN_SPLASH_MS = 450;
/** Hard ceiling: a deep link, a signed-out start, or a stalled load must still hand over. */
const MAX_SPLASH_MS = 2500;

// Hold the native splash until JS is ready, and ask iOS to cross-dissolve it
// rather than cut. Android cross-fades by default. Both are called at module
// scope, before any render, as Expo requires.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden, or no splash configured */
});
SplashScreen.setOptions({ fade: true, duration: 400 });

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
      <Shell />
    </ClerkProvider>
  );
}

function Shell() {
  const { isLoaded } = useAuth();
  const ready = useSplashReady(isLoaded);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.paper },
        }}
      >
        {/* No transition between tabs — they're peers, not a drill-down. */}
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        {/* A real sub-page, so it gets the normal push animation. */}
        <Stack.Screen name="connect" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <SplashOverlay ready={ready} />
    </>
  );
}

/**
 * When to hand over from the splash.
 *
 * Waits for Clerk, for the first screen's data to settle, and for a brief
 * minimum — so the app is never revealed mid-load. Capped, because a splash that
 * never leaves is far worse than one that leaves early.
 */
function useSplashReady(clerkLoaded: boolean): boolean {
  const [content, setContent] = useState(isContentReady());
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => subscribeContentReady(() => setContent(true)), []);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (content) return;
    const t = setTimeout(() => setTimedOut(true), MAX_SPLASH_MS);
    return () => clearTimeout(t);
  }, [content]);

  return clerkLoaded && minElapsed && (content || timedOut);
}

/** Better than a crash: says exactly what to set. */
function MissingKey() {
  useEffect(() => {
    // Nothing is going to load, so don't leave the user staring at the splash.
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

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
