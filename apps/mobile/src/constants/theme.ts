/**
 * SCOOP's design tokens.
 *
 * Lifted from the web app's `styles.css` so both apps share one visual language:
 * a 3px ink border, hard offset shadows, and the paper/ink/yolk/hot/cyan/grape
 * palette. Change a value here and the mobile app follows; the web app's copy
 * lives in its own `@theme` block.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  ink: '#111111',
  paper: '#faf6f0',
  paper2: '#fff8ee',
  yolk: '#ffd700',
  hot: '#ff3ea5',
  cyan: '#00d4ff',
  grape: '#7b2fff',
  mute: '#4a4654',
} as const;

/** Accent colour per item type, matching the web `TypeBadge` tones. */
export const TypeTone = {
  event: Palette.grape,
  deadline: Palette.hot,
  task: Palette.yolk,
  rsvp: Palette.cyan,
} as const;

export const Border = { thick: 3 } as const;

export const Radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

/**
 * React Native has no `box-shadow`, and Android's `elevation` is always soft —
 * so the hard offset shadow is drawn as a real offset View behind the panel
 * (see `Panel`). This keeps the look identical on both platforms.
 */
export const Shadow = { sm: 3, md: 4, lg: 6 } as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  android: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
});

/** Kept so the Expo template's remaining helpers still resolve. */
export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.paper,
    backgroundElement: Palette.paper2,
    backgroundSelected: Palette.paper2,
    textSecondary: Palette.mute,
  },
  dark: {
    text: Palette.ink,
    background: Palette.paper,
    backgroundElement: Palette.paper2,
    backgroundSelected: Palette.paper2,
    textSecondary: Palette.mute,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
