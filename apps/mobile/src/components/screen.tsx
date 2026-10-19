import { memo, type ReactElement, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectorsButton } from '@/components/connectors-button';
import { LogoutButton } from '@/components/logout-button';
import { NavBar } from '@/components/nav-bar';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/constants/theme';

/** The sticker pill used for the small uppercase label above a screen title. */
export const Sticker = memo(function Sticker({
  label,
  tone = Palette.grape,
}: {
  label: string;
  tone?: string;
}) {
  const dark = tone !== Palette.yolk;
  return (
    <View style={[styles.sticker, { backgroundColor: tone }]}>
      <Text style={[styles.stickerText, { color: dark ? Palette.paper : Palette.ink }]}>
        {label}
      </Text>
    </View>
  );
});

/**
 * Common screen chrome: safe area, scrolling content, a centred max-width column
 * and consistent padding. Every screen uses it so they line up.
 *
 * The header row carries the two main destinations on the left and Connectors on
 * the right — Connectors is a secondary screen, reached by a button rather than
 * sitting alongside Plan and Capture.
 */
export function Screen({
  sticker,
  title,
  subtitle,
  children,
  refreshControl,
}: {
  sticker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        <View style={styles.header}>
          <NavBar />
          <View style={styles.headerRight}>
            <ConnectorsButton />
            <LogoutButton />
          </View>
        </View>
        {sticker ? <Sticker label={sticker} /> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six + Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sticker: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stickerText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: {
    marginTop: Spacing.three,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: Palette.ink,
    textTransform: 'uppercase',
  },
  subtitle: { marginTop: Spacing.two, fontSize: 14, color: Palette.mute, lineHeight: 20 },
});
