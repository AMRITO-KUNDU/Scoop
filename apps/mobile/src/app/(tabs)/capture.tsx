import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DraftCard } from '@/components/draft-card';
import { EmptyState } from '@/components/empty-state';
import { RequireAuth } from '@/components/require-auth';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { takePendingShare } from '@/lib/incoming-share';
import { deviceTimezone, type DraftItem } from '@/lib/plan';

export default function CaptureScreen() {
  return (
    <RequireAuth>
      <Capture />
    </RequireAuth>
  );
}

function Capture() {
  const api = useApi();
  const router = useRouter();

  const [text, setText] = useState('');

  // A message shared into SCOOP from another app is handed over before this
  // screen mounts; take it once and drop it in the box.
  useEffect(() => {
    const shared = takePendingShare();
    if (!shared) return;
    setText(shared);
    setDrafts(null);
    setNotice(null);
    setCollapsed(false);
  }, []);
  const [extracting, setExtracting] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [engine, setEngine] = useState<'groq' | 'local' | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A pasted message is a document, not a form field: collapse it into a card so
  // the screen still reads as a form.
  const [collapsed, setCollapsed] = useState(false);

  const canExtract = text.trim().length >= 8 && !extracting;

  async function extract() {
    setExtracting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api.capture(text);
      setDrafts(result.items.map((item, index) => ({ ...item, key: String(index) })));
      setEngine(result.engine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that message.');
    } finally {
      setExtracting(false);
    }
  }

  async function addToPlan() {
    if (!drafts?.length) return;
    setAdding(true);
    setError(null);
    try {
      const result = await api.addItems(
        drafts.map(({ key: _key, ...item }) => item),
        deviceTimezone(),
      );
      const synced = result.synced ? ` ${result.synced} synced.` : '';
      setNotice(
        result.added === 0
          ? 'Those items are already in your plan.'
          : `Added ${result.added} item${result.added === 1 ? '' : 's'} to your plan.${synced}`,
      );
      setDrafts(null);
      setText('');
      setEngine(null);
      router.navigate({ pathname: '/', params: { filter: 'all' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add those items.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Screen
      sticker="Capture"
      title="Dump the chaos."
      subtitle="Paste a WhatsApp message, a school email, or just type what's in your head."
    >
      {collapsed ? (
        <Panel style={styles.panel}>
          <View style={styles.pastedRow}>
            <View style={styles.pastedIcon}>
              <Text style={styles.pastedIconText}>Aa</Text>
            </View>
            <View style={styles.pastedBody}>
              <Text style={styles.pastedTitle}>Pasted message</Text>
              <Text style={styles.pastedPreview} numberOfLines={1}>
                {text.trim().split(/\n+/)[0]}
              </Text>
              <Text style={styles.pastedMeta}>
                {text.trim().length} characters · {text.trim() ? text.trim().split(/\n+/).length : 0}{' '}
                lines
              </Text>
            </View>
          </View>
          <View style={styles.pastedActions}>
            <Pressable onPress={() => setCollapsed(false)} style={styles.pastedButton}>
              <Text style={styles.pastedButtonLabel}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setText('');
                setCollapsed(false);
                setDrafts(null);
                setNotice(null);
              }}
              style={styles.pastedButton}
            >
              <Text style={styles.pastedButtonLabel}>Clear</Text>
            </Pressable>
          </View>
        </Panel>
      ) : (
        <Panel style={styles.panel}>
          <TextInput
            value={text}
            onChangeText={(next: string) => {
              // A jump this big is a paste, not typing — collapse it.
              const pasted = next.length - text.length > 100;
              setText(next);
              setNotice(null);
              if (pasted && next.trim().length >= 200) setCollapsed(true);
            }}
            multiline
            textAlignVertical="top"
            placeholder="Paste a message from school, a club or a group chat…"
            placeholderTextColor={Palette.mute}
            accessibilityLabel="Paste a school message"
            style={styles.input}
          />
        </Panel>
      )}

      <Button
        label={extracting ? 'Reading…' : 'Make sense of it'}
        variant="yolk"
        size="lg"
        loading={extracting}
        disabled={!canExtract}
        onPress={() => void extract()}
        style={styles.primary}
      />

      {error ? <EmptyState title="Something went wrong" body={error} /> : null}

      {notice ? (
        <Panel style={styles.panel} tone={Palette.paper2}>
          <View style={styles.noticeInner}>
            <Text style={styles.notice}>{notice}</Text>
          </View>
        </Panel>
      ) : null}

      {drafts ? (
        <>
          <Text style={styles.sectionTitle}>
            {drafts.length
              ? `${drafts.length} item${drafts.length === 1 ? '' : 's'} — tweak anything before it goes in`
              : 'No items found'}
          </Text>
          {engine ? (
            <Text style={styles.engine}>SCOOP read this for you — edit anything before saving.</Text>
          ) : null}

          {drafts.map((draft) => (
            <DraftCard
              key={draft.key}
              draft={draft}
              onChange={(next) =>
                setDrafts((prev) => (prev ?? []).map((d) => (d.key === next.key ? next : d)))
              }
              onRemove={() => setDrafts((prev) => (prev ?? []).filter((d) => d.key !== draft.key))}
            />
          ))}

          {drafts.length ? (
            <Button
              label="Add to my plan"
              variant="ink"
              size="lg"
              loading={adding}
              onPress={() => void addToPlan()}
              style={styles.primary}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: Spacing.four },
  input: {
    minHeight: 160,
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 21,
    color: Palette.ink,
  },
  pastedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  pastedIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paper2,
  },
  pastedIconText: { fontSize: 13, fontWeight: '900', color: Palette.ink },
  pastedBody: { flex: 1, minWidth: 0 },
  pastedTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.ink,
  },
  pastedPreview: { marginTop: 2, fontSize: 13, fontWeight: '600', color: Palette.mute },
  pastedMeta: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.mute,
  },
  pastedActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  pastedButton: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pastedButtonLabel: { fontSize: 12, fontWeight: '800', color: Palette.ink },
  primary: { marginTop: Spacing.four },
  noticeInner: { padding: Spacing.three },
  notice: { fontSize: 14, fontWeight: '600', color: Palette.ink },
  sectionTitle: {
    marginTop: Spacing.five,
    fontSize: 18,
    fontWeight: '800',
    color: Palette.ink,
  },
  engine: { marginTop: Spacing.one, fontSize: 12, fontWeight: '600', color: Palette.mute },
});
