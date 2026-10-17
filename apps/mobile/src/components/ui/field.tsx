import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { Border, Palette, Radius, Spacing } from '@/constants/theme';

/** Labelled text input, styled to match the web app's form fields. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.mute}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.mute,
  },
  input: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.sm,
    backgroundColor: Palette.paper2,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: Palette.ink,
  },
});
