import { StyleSheet, Text, View } from 'react-native';

import { Border, Palette } from '@/constants/theme';

/**
 * The SCOOP mark — the same cyan-offset square behind a yolk card as the web
 * app's `Logo`, built from Views rather than SVG so it needs no dependency.
 */
export function Logo({ size = 36 }: { size?: number }) {
  const offset = Math.max(2, Math.round(size * 0.11));
  const radius = Math.round(size * 0.22);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.back,
          { width: size, height: size, borderRadius: radius, top: offset, left: offset },
        ]}
      />
      <View
        style={[
          styles.front,
          { width: size, height: size, borderRadius: radius, borderWidth: Border.thick },
        ]}
      >
        <Text style={[styles.letter, { fontSize: Math.round(size * 0.5) }]}>S</Text>
      </View>
    </View>
  );
}

/** Mark plus wordmark, for places with room — the sign-in screen, for instance. */
export function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <View style={styles.wordmark}>
      <Logo size={size} />
      <Text style={[styles.word, { fontSize: Math.round(size * 0.6) }]}>SCOOP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', backgroundColor: Palette.cyan },
  front: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.yolk,
    borderColor: Palette.ink,
  },
  letter: { fontWeight: '900', color: Palette.ink, lineHeight: undefined },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: { fontWeight: '900', letterSpacing: -1, color: Palette.ink },
});
