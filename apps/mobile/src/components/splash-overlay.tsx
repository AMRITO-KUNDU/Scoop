import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

import { Palette } from '@/constants/theme';

/**
 * Bridges the native splash screen into the app, with no visible seam.
 *
 * The sequence matters, and each step exists to remove a specific flash:
 *
 * 1. This overlay's first frame deliberately mirrors the native splash — same
 *    background colour, same image at the same width. The two are
 *    indistinguishable, so nothing appears to change.
 * 2. Only once that frame has laid out do we hide the native splash. Hiding it
 *    earlier (or rendering the overlay with different dimensions) is what
 *    produces the visible jump.
 * 3. When there is real content behind it, the overlay fades out and unmounts,
 *    handing over to the app.
 *
 * `SplashScreen.setOptions({ fade: true })` handles the native side's own exit
 * on iOS; Android cross-fades by default. This overlay covers the JS side, where
 * a dev build or Expo Go would otherwise cut straight to the app.
 */
export function SplashOverlay({ ready }: { ready: boolean }) {
  const [handedOver, setHandedOver] = useState(false);
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  function onLayout() {
    if (handedOver) return;
    setHandedOver(true);
    // The overlay is now painting the same picture; drop the native one.
    void SplashScreen.hideAsync().catch(() => {});
  }

  useEffect(() => {
    if (!ready || !handedOver) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [ready, handedOver, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      onLayout={onLayout}
      pointerEvents={ready ? 'none' : 'auto'}
      style={[styles.overlay, { opacity }]}
    >
      <Image
        source={require('../../assets/images/splash-icon.png')}
        style={styles.mark}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Must match the splash config in app.json, or the handoff shows a seam.
    backgroundColor: Palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // Must match `imageWidth` in the expo-splash-screen plugin config.
  mark: { width: 160, height: 160 },
});
