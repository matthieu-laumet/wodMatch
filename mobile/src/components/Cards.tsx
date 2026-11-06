import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Countdown, Cta, Gauge } from './MatchComponents';
import type { JoinItem, RecruitItem } from '@/types/competition';
import { daysUntil, formatDate, likersSentence, missingLabel, plural } from '@/utils/helper';
import { Colors, fonts } from '@/constants/theme';
import { AvatarRow, StatusBlock, hub } from './Hubcomponents';

export type Handlers = { onTreat: (competitionId: number) => void; onSwipe: (competitionId: number) => void };

export function EmptyState({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Cta primary={false} label={action} onPress={onPress} />
    </View>
  );
}

type Shell = {
  competitionId: number;
  name: string;
  kicker: string;
  days: number;
  likers: { name: string; photoUrl?: string | null }[];
  likeTitle: string;
  matches: { name: string; photoUrl?: string | null }[];
  h: Handlers;
  children?: React.ReactNode;
  compact?: boolean;
};

/** Card H5 : toute la card est cliquable → détail de la compétition. */
function CompetitionCard({ competitionId, name, kicker, days, likers, likeTitle, matches, h, children, compact = false }: Shell) {
  const hasWork = likers.length > 0 || matches.length > 0;
  const cta = likers.length > 0 ? 'Traiter les likes' : matches.length > 0 ? 'Voir les matchs' : 'Aller swiper';
  const open = () => (hasWork ? h.onTreat(competitionId) : h.onSwipe(competitionId));
  const summary = [
    likers.length > 0 ? plural(likers.length, 'like', 'likes') : null,
    matches.length > 0 ? plural(matches.length, 'match', 'matchs') : null,
  ].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={open} accessibilityRole="button" accessibilityLabel={`${name}. ${cta}`}
      style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.pressed]}
    >
      <View style={styles.countdown} pointerEvents="none">
        <Countdown days={days} small={compact}/>
      </View>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={[styles.title, compact && styles.titleCompact]}>{name}</Text>
        </View>
      </View>

      {children}

      {compact ? (
        <View style={styles.compactFooter}>
          <View style={styles.compactAvatars}>
            {likers.length > 0 && <AvatarRow people={likers} kind="like" size={36} max={2} surface={Colors.white} />}
            {matches.length > 0 && <AvatarRow people={matches} kind="match" size={36} max={2} surface={Colors.white} />}
          </View>
          <Text style={[styles.open, likers.length === 0 && matches.length > 0 && { color: hub.match }]}>
            {hasWork ? `${summary} ›` : 'Aller swiper ›'}
          </Text>
        </View>
      ) : (
        <>
          {likers.length > 0 && <StatusBlock kind="like" people={likers} title={likeTitle} />}
          {matches.length > 0 && (
            <StatusBlock
              kind="match"
              people={matches}
              title={matches.length === 1 ? matches[0].name : `${matches[0].name} et ${plural(matches.length - 1, 'autre', 'autres')}`}
              subtitle={plural(matches.length, 'match en cours', 'matchs en cours')}
            />
          )}
          <View style={styles.footer}>
            <Text style={styles.hint}>{hasWork ? 'Appuie pour répondre' : 'Rien à traiter pour l’instant'}</Text>
            <Text style={styles.open}>{hasWork ? 'Ouvrir ›' : `${cta} ›`}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

export function RecruitCard({ item, h, compact }: { item: RecruitItem; h: Handlers; compact?: boolean }) {
  const { competition: c, team, likers, matches } = item;
  const total = team.slots.length;
  const filled = team.slots.filter((s) => s.filledBy !== null).length;
  const pending = Math.min(likers.length, total - filled); // plus de likes que de places libres : on plafonne
  return (
    <CompetitionCard
      competitionId={c.id} name={c.name} days={daysUntil(c.startDate)} h={h}
      kicker={`${team.name} · ${team.division}`} compact={compact}
      likers={likers} likeTitle={likersSentence(likers.map((l) => l.name), 'personne')} matches={matches}
    >
      <View style={styles.row}>
        <Gauge slots={team.slots} pending={pending} />
        <Text style={styles.small}>
          <Text style={styles.bold}>{filled} / {total}</Text> · {missingLabel(team.slots, team.division)}
        </Text>
      </View>
    </CompetitionCard>
  );
}

export function JoinCard({ item, h, compact }: { item: JoinItem; h: Handlers; compact?: boolean }) {
  const { competition: c, likers, matches, division } = item;
  return (
    <CompetitionCard
      competitionId={c.id} name={c.name} days={daysUntil(c.startDate)} h={h}
      kicker={`Tu cherches une team · ${division} · ${formatDate(c.startDate)}`}
      compact={compact}
      likers={likers} likeTitle={likersSentence(likers.map((l) => l.name), 'team')} matches={matches}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderColor: Colors.line, borderRadius: 20, padding: 14, gap: 12, backgroundColor: Colors.white },
  bold: { fontWeight: '700' },
  pressed: { opacity: 0.85 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kicker: { fontSize: 12, fontWeight: '600', color: Colors.muted },
  title: { fontFamily: fonts.display, fontSize: 26, fontWeight: '800', textTransform: 'uppercase', color: Colors.ink, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  small: { flex: 1, fontSize: 12, fontWeight: '600', color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, color: Colors.muted },
  open: { fontSize: 14, fontWeight: '700', color: Colors.red },
  empty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#BBB', borderRadius: 16, padding: 16, gap: 10 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  countdown: { position: 'absolute', top: 0, right: 14 },
  cardCompact: { padding: 12, gap: 10, borderRadius: 16 },
  titleCompact: { fontSize: 22 },
  flex: { flex: 1, paddingRight: 80 }, // réserve la place du J-xx, sinon un long titre passe dessous
  compactFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  compactAvatars: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
});