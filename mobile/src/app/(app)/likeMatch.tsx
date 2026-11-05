import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { JoinTab, RecruitTab } from '@/components/Cards';
import { brand, Colors, gray } from '@/constants/theme';
import { useLikesHub } from '@/hooks/queries'; // ← adapte le chemin
import { plural } from '@/utils/helper';

type Tab = 'join' | 'recruit';

export default function LikeMatch() {
  const { data, isLoading, refetch, isRefetching } = useLikesHub();
  const recruit = data?.recruit ?? [];
  const join = data?.join ?? [];

  const pending = useMemo(
    () => ({
      recruit: recruit.reduce((n, i) => n + i.likers.length, 0),
      join: join.reduce((n, i) => n + i.likers.length, 0),
    }),
    [recruit, join],
  );

  // null tant que l'utilisateur n'a pas choisi : l'onglet par défaut se calcule
  // APRÈS le chargement (avec useState(initial) il serait figé sur des données vides)
  const [picked, setPicked] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (pending.recruit === 0 && pending.join > 0 ? 'join' : 'recruit');

  const byPriority = <T extends { competition: { startDate: string }; likers: unknown[] }>(a: T, b: T) =>
    b.likers.length - a.likers.length || a.competition.startDate.localeCompare(b.competition.startDate);

  const handlers = {
    onTreat: (id: number) => console.log('TODO ouvrir le détail compétition', id),
    onSwipe: (id: number) => console.log('TODO ouvrir le swipe', id),
  };

  const count = pending[tab];

  return (
    <ScrollView
      style={styles.screen} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={async () => { await refetch(); }} />}
    >
      <View style={styles.tabs}>
        {(['join', 'recruit'] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setPicked(t)} accessibilityRole="tab" accessibilityState={{ selected: active }}
              style={styles.tab}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t === 'join' ? 'Je rejoins' : 'Je recrute'}</Text>
              {!active && pending[t] > 0 && <View style={styles.badge} />}
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.list}>
          {count > 0 && (
            <View style={styles.headerLine}>
              <Text style={styles.heading}>À traiter</Text>
              <Text style={styles.subTitle}>
                {tab === 'recruit'
                  ? plural(count, 'personne t’a liké', 'personnes t’ont liké')
                  : plural(count, 'team t’a liké', 'teams t’ont liké')}
              </Text>
            </View>
          )}

          {tab === 'recruit' && <RecruitTab items={recruit} handlers={handlers} />}
          {tab === 'join' && <JoinTab items={join} handlers={handlers} />}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  heading: { fontWeight: '700', fontSize: 16, textTransform: 'uppercase', color: Colors.ink },
  subTitle: { fontWeight: '500', fontSize: 14, color: gray.g07 },
  tabs: { flexDirection: 'row', marginTop: 2, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#808080' },
  tab: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  tabTextActive: { borderBottomWidth: 3, width: '100%', fontWeight: '800', color: gray.g10, textAlign: 'center', borderBottomColor: brand.red, paddingBottom: 14 },
  tabText: { fontWeight: '700', fontSize: 16, color: gray.g07, paddingBottom: 14 },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red },
  list: { gap: 12, marginTop: 14 },
});