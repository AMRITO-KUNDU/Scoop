import type { ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectorsButton } from '@/components/connectors-button';
import { Logo } from '@/components/logo';
import { NavBar } from '@/components/nav-bar';
import { SignOutButton } from '@/components/sign-out-button';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/constants/theme';

/** The sticker pill used for the small uppercase label above a screen title. */
export function Sticker({ label, tone = Palette.grape }: { label: string; tone?: string }) {
  const dark = tone !== Palette.yolk;
  return (
    <View style={[styles.sticker, { backgroundColor: tone }]}>
      <Text style={[styles.stickerText, { color: dark ? Palette.paper : Palette.ink }]}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Common screen chrome: safe area, scrolling content, a centred max-width column
 * and consistent padding. Every screen uses it so they line up.
 *
 * The header mirrors the web app's: the SCOOP mark on the left, the two main
 * destinations in the middle, and the secondary actions on the right. As on the
 * web, the wordmark itself is dropped at this size — the mark carries it.
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
          <Logo size={34} />
          <View style={styles.headerNav}>
            <NavBar />
          </View>
          <View style={styles.headerRight}>
            <ConnectorsButton />
            <SignOutButton />
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
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  headerNav: { flex: 1, flexShrink: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
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
