import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, JoinCard, RecruitCard } from '@/components/Cards';
import { joinMock, recruitMock } from '@/components/Mock';
import { brand, Colors, fonts, gray } from '@/constants/theme';

type Tab = 'join' | 'recruit';

// TODO: remplacer par les vraies données (voir les commentaires dans types.ts)
const useLikesHub = () => ({ recruit: recruitMock, join: [] });

export default function LikeMatch() {
  const { recruit, join } = useLikesHub();

  // Onglet ouvert par défaut : celui où il y a des likes à traiter
  const pending = useMemo(
    () => ({
      recruit: recruit.reduce((n, i) => n + i.likers.length, 0),
      join: join.reduce((n, i) => n + i.likers.length, 0),
    }),
    [recruit, join],
  );
  const [tab, setTab] = useState<Tab>(pending.recruit === 0 && pending.join > 0 ? 'join' : 'recruit');

  // Tri : compétitions avec likes à traiter d'abord, puis par date
  const byPriority = <T extends { competition: { startDate: string }; likers: unknown[] }>(a: T, b: T) =>
    b.likers.length - a.likers.length || a.competition.startDate.localeCompare(b.competition.startDate);

  const handlers = {
    onTreat: (id: number) => console.log('TODO ouvrir le détail compétition', id), // router.push(`/likes/${id}`)
    onSwipe: (id: number) => console.log('TODO ouvrir le swipe', id),              // router.push('/swipe')
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* <Text style={styles.heading}>Likes & matchs</Text>
      <Text style={styles.subTitle}>Choisis ton rôle puis ta compétition</Text> */}

      <View style={styles.tabs}>
        {(['join', 'recruit'] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: active }}
              style={styles.tab}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t === 'join' ? 'Je rejoins' : 'Je recrute'}</Text>
              {!active && pending[t] > 0 && <View style={styles.badge} />}
            </Pressable>
          );
        })}
      </View>

      {tab === 'recruit' && 
        <View style={styles.list}>
          {recruit.length > 0 && 
            <>
              <View style={styles.headerLine}>
                <Text style={styles.heading}>À traiter</Text>
                <Text style={styles.subTitle}>3 Personnes t'on likés</Text>
              </View>
              {[...recruit].sort(byPriority).map((item) => <RecruitCard key={item.team.id} item={item} h={handlers} />)}
            </>
          }
        </View>
      }

      {/* <View style={styles.list}>
        {tab === 'recruit' ? (
          <>
            {[...recruit].sort(byPriority).map((item) => <RecruitCard key={item.team.id} item={item} h={handlers} />)}
            <EmptyState title="Une autre compétition en vue ?" action="+ Créer une team" onPress={() => console.log('TODO créer une team')} />
          </>
        ) : join.length === 0 ? (
          <EmptyState title="Tu ne cherches aucune team pour l'instant." action="Choisir une compétition" onPress={() => console.log('TODO compétitions')} />
        ) : (
          <>
            {[...join].sort(byPriority).map((item) => <JoinCard key={item.competition.id} item={item} h={handlers} />)}
            <EmptyState title="Une autre compétition ?" action="+ Chercher une team" onPress={() => console.log('TODO compétitions')} />
          </>
        )}
      </View> */}
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