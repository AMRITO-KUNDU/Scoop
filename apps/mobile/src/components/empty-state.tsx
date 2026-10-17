import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { Panel } from '@/components/ui/panel';

/** The "nothing here yet" card, matching the web app's EmptyState. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Panel style={styles.wrap}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.three },
  inner: { padding: Spacing.four, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Palette.ink, textAlign: 'center' },
  body: {
    marginTop: Spacing.two,
    fontSize: 14,
    color: Palette.mute,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: { marginTop: Spacing.three, alignSelf: 'stretch' },
});
