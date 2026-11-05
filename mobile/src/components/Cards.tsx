import { StyleSheet, Text, View } from 'react-native';
import { AvatarStack, Countdown, Cta, Gauge, MatchLine } from './MatchComponents';
import type { JoinItem, RecruitItem } from '@/types/competition';
import { daysUntil, formatDate, likersSentence, missingLabel, plural } from '@/utils/helper';
import { Colors, fonts } from '@/constants/theme';

export type Handlers = { onTreat: (competitionId: number) => void; onSwipe: (competitionId: number) => void };
type TabProps<T> = { items: T[]; handlers: Handlers };

// Tri : compétitions avec likes à traiter d'abord, puis par date
const byPriority = <T extends { competition: { startDate: string }; likers: unknown[] }>(a: T, b: T) =>
  b.likers.length - a.likers.length || a.competition.startDate.localeCompare(b.competition.startDate);

/** Bouton : rouge s'il y a des likes à traiter, sinon secondaire. */
function MainAction({ likes, hasMatches, competitionId, h }: { likes: number; hasMatches: boolean; competitionId: number; h: Handlers }) {
  if (likes > 0) return <Cta primary label={`Traiter ${plural(likes, 'like', 'likes')}`} onPress={() => h.onTreat(competitionId)} />;
  if (hasMatches) return <Cta primary={false} label="Voir les matchs" onPress={() => h.onTreat(competitionId)} />;
  return <Cta primary={false} label="Aller swiper" onPress={() => h.onSwipe(competitionId)} />;
}

export function EmptyState({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Cta primary={false} label={action} onPress={onPress} />
    </View>
  );
}

export function RecruitTab({ items, handlers }: TabProps<RecruitItem>) {
  return (
    <>
      {[...items].sort(byPriority).map(({ competition: c, team, likers, matches }) => {
        const filled = team.slots.filter((s) => s.filledBy !== null).length;
        return (
          <View key={team.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.flex}>
                <Text style={styles.title}>{c.name}</Text>
                <Text style={styles.sub}>{team.division}</Text>
              </View>
              <Countdown days={daysUntil(c.startDate)} />
            </View>
            <View style={styles.row}>
              <Gauge slots={team.slots} />
              <Text style={styles.small}>
                <Text style={styles.bold}>{filled}/{team.slots.length}</Text> · {missingLabel(team.slots, team.division)}
              </Text>
            </View>
            {likers.length > 0 && (
              <View style={[styles.row, { marginTop: 14 }]}>
                <AvatarStack people={likers} />
                <Text style={styles.small}>{likersSentence(likers.map((l) => l.name), 'personne')}</Text>
              </View>
            )}
            <MainAction likes={likers.length} hasMatches={matches.length > 0} competitionId={c.id} h={handlers} />
            <MatchLine matches={matches} />
          </View>
        );
      })}
      {/* <EmptyState
        title="Une autre compétition en vue ?"
        action="+ Créer une team"
        onPress={() => console.log('TODO créer une team')}
      /> */}
    </>
  );
}

export function JoinTab({ items, handlers }: TabProps<JoinItem>) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Tu ne cherches aucune team pour l'instant."
        action="Choisir une compétition"
        onPress={() => console.log('TODO compétitions')}
      />
    );
  }

  return (
    <>
      {[...items].sort(byPriority).map(({ competition: c, likers, matches, division }) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.head}>
            <View style={styles.flex}>
              <Text style={styles.title}>{c.name}</Text>
              <Text style={styles.sub}>{c.city} · {formatDate(c.startDate)}</Text>
            </View>
            <Countdown days={daysUntil(c.startDate)} />
          </View>
          <View style={styles.row}>
            <View style={styles.pill}><Text style={styles.pillText}>Tu cherches une team</Text></View>
            <Text style={styles.small}>{division}</Text>
          </View>
          {likers.length > 0 && (
            <View style={[styles.row, { marginTop: 14 }]}>
              <AvatarStack people={likers} />
              <Text style={styles.small}>{likersSentence(likers.map((l) => l.name), 'team')}</Text>
            </View>
          )}
          <MainAction likes={likers.length} hasMatches={matches.length > 0} competitionId={c.id} h={handlers} />
          <MatchLine matches={matches} />
        </View>
      ))}
      <EmptyState
        title="Une autre compétition ?"
        action="+ Chercher une team"
        onPress={() => console.log('TODO compétitions')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderColor: Colors.line, borderRadius: 16, padding: 14, backgroundColor: Colors.white },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  flex: { flex: 1, paddingRight: 8 },
  title: { fontFamily: fonts.display, fontSize: 20, fontWeight: '700', textTransform: 'uppercase', color: Colors.ink },
  sub: { fontSize: 12, color: Colors.muted, marginTop: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  small: { flex: 1, fontSize: 12, color: '#333' },
  bold: { fontWeight: '700' },
  pill: { backgroundColor: Colors.ink, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#BBB', borderRadius: 16, padding: 16 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
});