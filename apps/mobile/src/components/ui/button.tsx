import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Border, Palette, Radius, Shadow } from '@/constants/theme';

export type ButtonVariant = 'yolk' | 'ink' | 'paper' | 'cyan' | 'grape';

const TONE: Record<ButtonVariant, { bg: string; fg: string }> = {
  yolk: { bg: Palette.yolk, fg: Palette.ink },
  ink: { bg: Palette.ink, fg: Palette.paper },
  paper: { bg: Palette.paper, fg: Palette.ink },
  cyan: { bg: Palette.cyan, fg: Palette.ink },
  grape: { bg: Palette.grape, fg: Palette.paper },
};

/**
 * The chunky bordered button, mirroring the web app's `Button`.
 *
 * Pass `icon` for a button that leads with a Lucide glyph, exactly as the web
 * does. `size="icon"` gives the icon-only square the web uses for compact
 * actions — there, always with an `accessibilityLabel`, since the glyph is the
 * only thing on screen.
 */
export function Button({
  label,
  onPress,
  icon: Icon,
  variant = 'yolk',
  disabled = false,
  loading = false,
  size = 'md',
  style,
  accessibilityLabel,
}: {
  label?: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const tone = TONE[variant];
  const inactive = disabled || loading;
  const iconOnly = size === 'icon';
  const glyph = iconOnly ? 20 : size === 'lg' ? 20 : 16;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }: { pressed: boolean }) =>
        StyleSheet.flatten([
          styles.base,
          size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : size === 'icon' ? styles.icon : styles.md,
          { backgroundColor: tone.bg },
          { transform: [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }] },
          inactive && styles.inactive,
          style,
        ])
      }
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : Icon ? (
        <Icon size={glyph} strokeWidth={2.4} color={tone.fg} />
      ) : null}
      {!iconOnly && label ? (
        <Text style={StyleSheet.flatten([styles.label, { color: tone.fg }, size === 'lg' && styles.labelLg])} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.md,
    shadowColor: Palette.ink,
    shadowOffset: { width: Shadow.sm, height: Shadow.sm },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.sm,
  },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 12, paddingHorizontal: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 20 },
  icon: { width: 48, height: 48, padding: 0 },
  inactive: { opacity: 0.5 },
  label: { fontFamily: 'system-ui', fontSize: 15, fontWeight: '700' },
  labelLg: { fontSize: 17 },
});
