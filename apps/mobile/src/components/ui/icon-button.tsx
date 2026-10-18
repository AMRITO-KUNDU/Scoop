import type { ComponentType } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Border, Palette, Radius, Shadow } from '@/constants/theme';

export type IconButtonVariant = 'paper' | 'paper2' | 'yolk' | 'ink' | 'grape';

const TONE: Record<IconButtonVariant, { bg: string; fg: string }> = {
  paper: { bg: Palette.paper, fg: Palette.ink },
  paper2: { bg: Palette.paper2, fg: Palette.ink },
  yolk: { bg: Palette.yolk, fg: Palette.ink },
  ink: { bg: Palette.ink, fg: Palette.paper },
  grape: { bg: Palette.grape, fg: Palette.paper },
};

export type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export function IconButton({
  icon: Icon,
  onPress,
  variant = 'paper',
  size = 38,
  iconSize = 18,
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: {
  icon: IconComponent;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  const tone = TONE[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor: tone.bg,
          transform: [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }],
        },
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : (
        <Icon size={iconSize} color={tone.fg} strokeWidth={2.4} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    shadowColor: Palette.ink,
    shadowOffset: { width: Shadow.sm, height: Shadow.sm },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.sm,
  },
  inactive: { opacity: 0.5 },
});
