import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, JoinCard, RecruitCard } from '@/components/Cards';
import { Colors } from '@/constants/theme';
import { useLikesHub } from '@/hooks/queries'; // ← adapte le chemin
import { SummaryBanner } from '@/components/Hubcomponents';

type Filter = 'all' | 'recruit' | 'join';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'recruit', label: 'Je recrute' },
  { key: 'join', label: 'Je cherche' },
];

type Row =
  | { kind: 'recruit'; key: string; item: NonNullable<ReturnType<typeof useLikesHub>['data']>['recruit'][number] }
  | { kind: 'join'; key: string; item: NonNullable<ReturnType<typeof useLikesHub>['data']>['join'][number] };

// Tri : likes à traiter d'abord, puis matchs, puis date de compétition
const priority = (a: Row, b: Row) =>
  b.item.likers.length - a.item.likers.length ||
  b.item.matches.length - a.item.matches.length ||
  a.item.competition.startDate.localeCompare(b.item.competition.startDate);

export default function LikeMatch() {
  const { data, isLoading, refetch, isRefetching } = useLikesHub();
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo<Row[]>(() => {
    const recruit: Row[] = (data?.recruit ?? []).map((item) => ({ kind: 'recruit', key: `r-${item.team.id}`, item }));
    const join: Row[] = (data?.join ?? []).map((item) => ({ kind: 'join', key: `j-${item.competition.id}`, item }));
    return [...recruit, ...join].sort(priority);
  }, [data]);

  // Le bandeau compte TOUT, quel que soit le filtre ; les pastilles de filtre signalent ce qui attend ailleurs.
  const totals = useMemo(() => ({
    likes: rows.reduce((n, r) => n + r.item.likers.length, 0),
    matches: rows.reduce((n, r) => n + r.item.matches.length, 0),
    recruit: rows.filter((r) => r.kind === 'recruit').reduce((n, r) => n + r.item.likers.length, 0),
    join: rows.filter((r) => r.kind === 'join').reduce((n, r) => n + r.item.likers.length, 0),
  }), [rows]);

  const visible = filter === 'all' ? rows : rows.filter((r) => r.kind === filter);

  const handlers = {
    onTreat: (id: number) => console.log('TODO ouvrir le détail compétition', id),
    onSwipe: (id: number) => console.log('TODO ouvrir le swipe', id),
  };

  return (
    <ScrollView
      style={styles.screen} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={async () => { await refetch(); }} />}
    >
      <Text style={styles.heading}>Likes & matchs</Text>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <>
          <SummaryBanner likes={totals.likes} matches={totals.matches} />

          <View style={styles.chips} accessibilityRole="tablist">
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              const dot = key !== 'all' && !active && totals[key] > 0;
              return (
                <Pressable key={key} onPress={() => setFilter(key)} accessibilityRole="tab" accessibilityState={{ selected: active }}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  {dot && <View style={styles.dot} />}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.list}>
            {visible.map((r) => r.kind === 'recruit'
              ? <RecruitCard key={r.key} item={r.item} h={handlers} />
              : <JoinCard key={r.key} item={r.item} h={handlers} />)}

            {visible.length === 0 && (
              <EmptyState
                title={filter === 'join' ? 'Tu ne cherches aucune team pour l’instant.' : 'Aucune compétition ici pour l’instant.'}
                action={filter === 'join' ? 'Choisir une compétition' : '+ Créer une team'}
                onPress={() => console.log('TODO')}
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  heading: { fontSize: 24, fontWeight: '700', textTransform: 'uppercase', color: Colors.ink },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, backgroundColor: '#EEE' },
  chipActive: { backgroundColor: Colors.ink },
  chipText: { fontSize: 13, fontWeight: '700', color: '#222' },
  chipTextActive: { color: Colors.white },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red },
  list: { gap: 12 },
});