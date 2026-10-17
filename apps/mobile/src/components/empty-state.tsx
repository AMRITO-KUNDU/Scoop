import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Panel } from '@/components/ui/panel';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';

/** The "nothing here yet" card, matching the web app's EmptyState. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Panel style={styles.wrap}>
      <View style={styles.inner}>
        {Icon ? (
          <View style={styles.badge}>
            <Icon size={22} strokeWidth={2.4} color={Palette.ink} />
          </View>
        ) : null}
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
  badge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.yolk,
    marginBottom: Spacing.three,
  },
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
