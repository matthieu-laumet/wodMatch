import { StyleSheet, Text, View } from 'react-native';
import { Avatar, AvatarStack, Countdown, Cta, Gauge, MatchLine } from './MatchComponents';
import { JoinItem, RecruitItem } from '@/types/competition';
import { daysUntil, likersSentence, missingLabel, plural, subtitle } from '@/utils/helper';
import { Colors, fonts } from '@/constants/theme';

type Handlers = { onTreat: (competitionId: number) => void; onSwipe: (competitionId: number) => void };

/** Bouton : rouge s'il y a des likes à traiter, sinon secondaire. */
function MainAction({ likes, hasMatches, competitionId, h }: { likes: number; hasMatches: boolean; competitionId: number; h: Handlers }) {
  if (likes > 0) return <Cta primary label={`Traiter ${plural(likes, 'like', 'likes')}`} onPress={() => h.onTreat(competitionId)} />;
  if (hasMatches) return <Cta primary={false} label="Voir les matchs" onPress={() => h.onTreat(competitionId)} />;
  return <Cta primary={false} label="Aller swiper" onPress={() => h.onSwipe(competitionId)} />;
}

export function RecruitCard({ item, h }: { item: RecruitItem; h: Handlers }) {
  const { competition: c, team, likers, matches } = item;
  const filled = team.slots.filter((s) => s.filledBy !== null).length;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={styles.title}>{c.name}</Text>
          <Text style={styles.sub}>{c.division_name}</Text>
        </View>
        <Countdown days={daysUntil(c.startDate)} />
      </View>
      <View style={styles.row}>
        <Gauge slots={team.slots} />
        <Text style={styles.small}><Text style={styles.bold}>{filled}/{team.slots.length}</Text> · {missingLabel(team.slots, team.division)}</Text>
      </View>
      {likers.length > 0 && (
        <View style={[styles.row, { marginTop: 14 }]}>
          <AvatarStack people={likers} />
          <Text style={styles.small}>{likersSentence(likers.map((l) => l.name), 'personne')}</Text>
        </View>
      )}
      <MainAction likes={likers.length} hasMatches={matches.length > 0} competitionId={c.id} h={h} />
      <MatchLine matches={matches} />
    </View>
  );
}

export function JoinCard({ item, h }: { item: JoinItem; h: Handlers }) {
  const { competition: c, likers, matches, division } = item;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={styles.title}>{c.name}</Text>
          <Text style={styles.sub}>{c.city} · {subtitle(c).split(' · ')[1]}</Text>
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
      <MainAction likes={likers.length} hasMatches={matches.length > 0} competitionId={c.id} h={h} />
      <MatchLine matches={matches} />
    </View>
  );
}

export function EmptyState({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Cta primary={false} label={action} onPress={onPress} />
    </View>
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