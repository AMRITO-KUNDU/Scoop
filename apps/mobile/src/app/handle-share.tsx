import { useRouter } from 'expo-router';
import { useIncomingShare } from 'expo-sharing';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { setPendingShare } from '@/lib/incoming-share';

/**
 * Where a share from another app lands.
 *
 * It does not show its own UI beyond a spinner: the payload is handed to the
 * capture screen, which already has the review-and-extract flow. One capture
 * screen, however the message arrived.
 */
export default function HandleShareScreen() {
  const router = useRouter();
  const { resolvedSharedPayloads, isResolving } = useIncomingShare();

  useEffect(() => {
    if (isResolving) return;

    // Resolved payloads carry `contentType`; we only care about shared text.
    const payloads = resolvedSharedPayloads as unknown as {
      contentType?: string;
      value?: string;
    }[];

    const text = payloads
      .filter((payload) => payload.contentType === 'text')
      .map((payload) => payload.value ?? '')
      .find((value) => value.trim().length > 0);

    if (text) setPendingShare(text);
    router.replace(text ? '/capture' : '/');
  }, [isResolving, resolvedSharedPayloads, router]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={Palette.ink} />
      <Text style={styles.label}>Reading what you shared…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    backgroundColor: Palette.paper,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.mute,
  },
});
