import { ArrowRight, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DraftCard } from '@/components/draft-card';
import { EmptyState } from '@/components/empty-state';
import { RequireAuth } from '@/components/require-auth';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Border, Palette, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { EXAMPLE_CHIPS } from '@/lib/examples';
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
  const [extracting, setExtracting] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [engine, setEngine] = useState<'groq' | 'local' | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canExtract = text.trim().length >= 8 && !extracting;
  const showEmpty = !extracting && drafts === null && text.trim().length === 0;

  async function extract() {
    setExtracting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api.capture(text);
      setDrafts(result.items.map((item, index) => ({ ...item, key: String(index) })));
      setEngine(result.engine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extract failed.');
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
          ? 'These items are already in your plan.'
          : `Added ${result.added} item${result.added === 1 ? '' : 's'} to your plan.${synced}`,
      );
      setDrafts(null);
      setText('');
      setEngine(null);
      // Show the result: the plan is where the items now live.
      router.navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add items.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Screen
      sticker="Capture"
      title="Dump the chaos."
      subtitle="Paste a school email, WhatsApp newsletter or flyer. We’ll make the plan."
    >
      <Panel style={styles.panel}>
        <TextInput
          value={text}
          onChangeText={(next: string) => {
            setText(next);
            setNotice(null);
          }}
          multiline
          textAlignVertical="top"
          placeholder="Paste any school email, WhatsApp message, newsletter or flyer text…"
          placeholderTextColor={Palette.mute}
          accessibilityLabel="Paste a school message"
          style={styles.input}
        />
      </Panel>

      <View style={styles.chips}>
        {EXAMPLE_CHIPS.map((chip) => (
          <Pressable
            key={chip.id}
            onPress={() => {
              setText(chip.text);
              setDrafts(null);
              setNotice(null);
            }}
            style={styles.chip}
          >
            <Text style={styles.chipLabel}>{chip.label}</Text>
          </Pressable>
        ))}
      </View>

      <Button
        label={extracting ? 'Making a plan…' : 'Extract'}
        icon={extracting ? undefined : ArrowRight}
        variant="yolk"
        size="lg"
        loading={extracting}
        disabled={!canExtract}
        onPress={() => void extract()}
        style={styles.primary}
      />

      {error ? <EmptyState title="Something went wrong" body={error} /> : null}

      {showEmpty ? (
        <EmptyState
          icon={Sparkles}
          title="Nothing pasted yet"
          body="Drop in a messy school email or tap a chip above. We’ll pull out events, deadlines, tasks and RSVPs."
        />
      ) : null}

      {notice ? (
        <Panel style={styles.panel} tone={Palette.paper2}>
          <View style={styles.noticeInner}>
            <Text style={styles.notice}>{notice}</Text>
          </View>
        </Panel>
      ) : null}

      {drafts ? (
        <>
          {engine ? (
            <View style={styles.engineSticker}>
              <Text style={styles.engineText}>
                {engine === 'groq' ? 'Extracted with Groq' : 'Extracted on-device'}
              </Text>
            </View>
          ) : null}
          <Text style={styles.sectionTitle}>
            {drafts.length ? 'We made a plan!' : 'No items found'}
          </Text>
          <Text style={styles.sectionBody}>
            {drafts.length
              ? `${drafts.length} item${drafts.length === 1 ? '' : 's'} — tweak anything before it goes in`
              : 'Nothing to pull from that message.'}
          </Text>

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
              label={adding ? 'Adding…' : 'Looks Good – Add to Plan'}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  chip: {
    borderWidth: Border.thick,
    borderColor: Palette.ink,
    borderRadius: Radius.pill,
    backgroundColor: Palette.paper2,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipLabel: { fontSize: 12, fontWeight: '700', color: Palette.ink },
  primary: { marginTop: Spacing.four },
  noticeInner: { padding: Spacing.three },
  notice: { fontSize: 14, fontWeight: '600', color: Palette.ink },
  engineSticker: {
    alignSelf: 'flex-start',
    marginTop: Spacing.five,
    borderRadius: Radius.pill,
    backgroundColor: Palette.grape,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  engineText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.paper,
  },
  sectionTitle: {
    marginTop: Spacing.three,
    fontSize: 22,
    fontWeight: '900',
    color: Palette.ink,
    textTransform: 'uppercase',
  },
  sectionBody: { marginTop: Spacing.one, fontSize: 13, fontWeight: '600', color: Palette.mute },
});
