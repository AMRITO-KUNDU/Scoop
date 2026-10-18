import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Border, Palette, Radius, Shadow } from '@/constants/theme';

export type ButtonVariant = 'yolk' | 'ink' | 'paper';

const TONE: Record<ButtonVariant, { bg: string; fg: string }> = {
  yolk: { bg: Palette.yolk, fg: Palette.ink },
  ink: { bg: Palette.ink, fg: Palette.paper },
  paper: { bg: Palette.paper, fg: Palette.ink },
};

/**
 * The chunky bordered button. Pressing nudges it into its own shadow, the same
 * trick the web app uses.
 */
export function Button({
  label,
  onPress,
  variant = 'yolk',
  disabled = false,
  loading = false,
  size = 'md',
  icon: Icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: (props: { size?: number; color?: string; strokeWidth?: number }) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const tone = TONE[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: tone.bg, transform: [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }] },
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : Icon ? (
        <Icon
          size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          color={tone.fg}
          strokeWidth={2.4}
        />
      ) : null}
      <Text
        style={[styles.label, { color: tone.fg }, size === 'lg' && styles.labelLg]}
        numberOfLines={1}
      >
        {label}
      </Text>
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
  inactive: { opacity: 0.5 },
  label: { fontFamily: 'system-ui', fontSize: 15, fontWeight: '700' },
  labelLg: { fontSize: 17 },
});
