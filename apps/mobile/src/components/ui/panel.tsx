import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Border, Palette, Radius, Shadow } from '@/constants/theme';

/**
 * The app's card: 3px ink border, rounded, with a hard offset shadow.
 *
 * The shadow is a real View offset behind the card rather than `box-shadow`
 * (which React Native doesn't have) or Android `elevation` (which is always
 * soft), so the look matches the web app on both platforms.
 */
export function Panel({
  children,
  style,
  tone,
  offset = Shadow.md,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Overrides the card background, e.g. Palette.paper2. */
  tone?: string;
  offset?: number;
}) {
  return (
    <View style={style}>
      <View
        pointerEvents="none"
        style={[
          styles.shadow,
          { top: offset, left: offset, right: -offset, bottom: -offset },
        ]}
      />
      <View style={[styles.body, tone ? { backgroundColor: tone } : null]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { position: 'absolute', backgroundColor: Palette.ink, borderRadius: Radius.lg },
  body: {
    backgroundColor: Palette.paper,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.lg,
  },
});
