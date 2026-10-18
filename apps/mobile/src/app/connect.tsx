import * as WebBrowser from 'expo-web-browser';
import { CalendarPlus, Check, ListChecks, RefreshCw, type LucideIcon } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { RequireAuth } from '@/components/require-auth';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Border, Palette, Radius, Shadow, Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { STATE_LABEL, type ConnectorId, type ConnectorStatus } from '@/lib/connectors';
import { deviceTimezone } from '@/lib/plan';

const CONNECTOR_ICON: Record<ConnectorId, LucideIcon> = {
  googlecalendar: CalendarPlus,
  googletasks: ListChecks,
};

export default function ConnectScreen() {
  return (
    <RequireAuth>
      <Connectors />
    </RequireAuth>
  );
}

function Connectors() {
  const api = useApi();
  const [connectors, setConnectors] = useState<ConnectorStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<ConnectorId | null>(null);

  const load = useCallback(async () => {
    try {
      setConnectors(await api.connectors());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load connectors.');
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  // Connected and something is waiting? Push it without being asked.
  useEffect(() => {
    if (!connectors) return;
    const waiting = connectors.some((c) => c.state === 'connected' && c.pendingCount > 0);
    if (!waiting) return;

    let alive = true;
    void (async () => {
      try {
        const result = await api.sync(deviceTimezone());
        if (!alive || result.synced === 0) return;
        setNotice(`Synced ${result.synced} item${result.synced === 1 ? '' : 's'}.`);
        setConnectors(await api.connectors());
      } catch {
        // A sync hiccup shouldn't take the page down; the button still works.
      }
    })();
    return () => {
      alive = false;
    };
  }, [connectors, api]);

  async function connect(id: ConnectorId) {
    setBusy(id);
    setError(null);
    try {
      const { url } = await api.connect(id);
      await WebBrowser.openBrowserAsync(url);
      // The user has now been to Google; re-check whether it took.
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the connection.');
    } finally {
      setBusy(null);
    }
  }

  async function sync(id: ConnectorId) {
    setBusy(id);
    setError(null);
    try {
      const result = await api.sync(deviceTimezone(), id);
      setNotice(
        result.synced === 0 && result.failed === 0
          ? 'Everything is already synced.'
          : `Synced ${result.synced}${result.failed ? `, ${result.failed} failed` : ''}.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sync.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen
      sticker="Connectors"
      title="Link your services."
      subtitle="Connect one and it keeps itself in step with your plan."
    >
      {error ? <EmptyState title="Something went wrong" body={error} /> : null}

      {notice ? (
        <Panel style={styles.panel} tone={Palette.paper2}>
          <View style={styles.noticeInner}>
            <Text style={styles.notice}>{notice}</Text>
          </View>
        </Panel>
      ) : null}

      {connectors === null && !error ? (
        <EmptyState title="Loading connectors…" body="One moment." />
      ) : null}

      {(connectors ?? []).map((connector) => {
        const Icon = CONNECTOR_ICON[connector.id];
        const connected = connector.state === 'connected';
        return (
          <Panel key={connector.id} style={styles.panel}>
            <View style={styles.inner}>
              <View style={styles.head}>
                <View style={styles.headLeft}>
                  <View style={[styles.iconBox, connected && styles.iconBoxConnected]}>
                    <Icon size={20} color={Palette.ink} strokeWidth={2.4} />
                  </View>
                  <View style={styles.titleCol}>
                    <Text style={styles.name}>{connector.name}</Text>
                    <Text style={styles.description}>{connector.description}</Text>
                  </View>
                </View>
                <View style={[styles.state, connected && styles.stateOn]}>
                  <Text style={[styles.stateLabel, connected && styles.stateLabelOn]}>
                    {STATE_LABEL[connector.state]}
                  </Text>
                </View>
              </View>

              <Text style={styles.detail}>{connector.detail}</Text>

              {connected ? (
                <Text style={styles.counts}>
                  {connector.syncedCount} in your calendar
                  {connector.pendingCount > 0 ? ` · ${connector.pendingCount} syncing` : ''}
                </Text>
              ) : null}

              {connector.state === 'unavailable' ? (
                <Text style={styles.unavailable}>
                  Not available on this account right now. Please try again later.
                </Text>
              ) : connected ? (
                <Button
                  label="Sync again"
                  variant="paper"
                  size="sm"
                  icon={RefreshCw}
                  loading={busy === connector.id}
                  onPress={() => void sync(connector.id)}
                  style={styles.action}
                />
              ) : (
                <>
                  <Button
                    label={`Connect ${connector.name}`}
                    variant="yolk"
                    size="lg"
                    icon={Icon}
                    loading={busy === connector.id}
                    onPress={() => void connect(connector.id)}
                    style={styles.action}
                  />
                  <View style={styles.hintRow}>
                    <Check size={14} color={Palette.mute} strokeWidth={2.6} />
                    <Text style={styles.hint}>
                      One tap — you'll approve access at Google, then you're done.
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Panel>
        );
      })}

      <Text style={styles.footer}>
        More connectors are on the way. Tell us which one you want next.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: Spacing.four },
  inner: { padding: Spacing.four },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    backgroundColor: Palette.paper2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.ink,
    shadowOffset: { width: Shadow.sm, height: Shadow.sm },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.sm,
  },
  iconBoxConnected: {
    backgroundColor: Palette.cyan,
  },
  titleCol: { flex: 1 },
  name: { fontSize: 18, fontWeight: '900', color: Palette.ink, textTransform: 'uppercase' },
  description: { marginTop: 2, fontSize: 13, fontWeight: '600', color: Palette.mute },
  state: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper2,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  stateOn: { backgroundColor: Palette.cyan },
  stateLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase', color: Palette.ink },
  stateLabelOn: { color: Palette.ink },
  detail: { marginTop: Spacing.three, fontSize: 14, lineHeight: 20, color: Palette.mute },
  counts: {
    marginTop: Spacing.three,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.mute,
  },
  unavailable: { marginTop: Spacing.three, fontSize: 12, color: Palette.mute },
  action: { marginTop: Spacing.four },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.two },
  hint: { fontSize: 12, color: Palette.mute },
  noticeInner: { padding: Spacing.three },
  notice: { fontSize: 14, fontWeight: '600', color: Palette.ink },
  footer: { marginTop: Spacing.five, fontSize: 12, color: Palette.mute },
});
