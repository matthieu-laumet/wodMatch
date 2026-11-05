import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { initials, STEP_LABEL } from '@/utils/helper';
import { Liker, MatchSummary, Slot } from '@/types/competition';
import { Colors, fonts, gray } from '@/constants/theme';

export function Avatar({ person, size = 34 }: { person: Liker; size?: number }) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  return person.avatarUrl ? (
    <Image source={{ uri: person.avatarUrl }} style={[styles.avatar, box]} />
  ) : (
    <View style={[styles.avatar, styles.avatarFallback, box]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials(person.name)}</Text>
    </View>
  );
}

export function AvatarStack({ people }: { people: Liker[] }) {
  return (
    <View style={styles.stack}>
      {people.slice(0, 3).map((p, i) => (
        <View key={p.id} style={i > 0 && styles.stackOverlap}>
          <Avatar person={p} />
        </View>
      ))}
    </View>
  );
}

/** Jauge segmentée : plein = rempli, rouge pointillé = place visée, gris = libre */
export function Gauge({ slots }: { slots: Slot[] }) {
  const firstOpen = slots.findIndex((s) => s.filledBy === null);
  return (
    <View style={styles.gauge}>
      {slots.map((s, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            s.filledBy !== null && styles.segmentFilled,
            i === firstOpen && styles.segmentTarget,
          ]}
        />
      ))}
    </View>
  );
}

/** Une ligne : étape du prochain match, ou résumé si plusieurs */
export function MatchLine({ matches }: { matches: MatchSummary[] }) {
  if (!matches.length) return null;
  const next = matches.find((m) => m.nextLabel) ?? matches[0];
  const detail = next.nextLabel ?? `étape « ${STEP_LABEL[next.step]} »`;
  return (
    <View style={styles.matchLine}>
      <View style={styles.dot} />
      <Text style={styles.matchText}>
        <Text style={styles.bold}>{matches.length} match{matches.length > 1 ? 's' : ''}</Text>
        {` · prochain : ${detail} avec ${next.name}`}
      </Text>
    </View>
  );
}

export function Cta({ label, onPress, primary }: { label: string; onPress: () => void; primary: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.cta, primary ? styles.ctaPrimary : styles.ctaSecondary, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.ctaText, !primary && { color: Colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Countdown({ days }: { days: number }) {
  return <Text style={[styles.countdown, days <= 14 && { color: Colors.red }]}>J-{days}</Text>;
}

const styles = StyleSheet.create({
  avatar: { borderWidth: 2, borderColor: Colors.white },
  avatarFallback: { backgroundColor: '#2B2B2B', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontWeight: '700' },
  stack: { flexDirection: 'row' },
  stackOverlap: { marginLeft: -10 },
  gauge: { flexDirection: 'row', gap: 4 },
  segment: { width: 26, height: 6, borderRadius: 3, backgroundColor: '#DCDCDC' },
  segmentFilled: { backgroundColor: Colors.ink },
  segmentTarget: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.red, borderStyle: 'dashed' },
  matchLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.line },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  matchText: { flex: 1, fontSize: 12, color: '#333' },
  bold: { fontWeight: '700' },
  cta: { height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  ctaPrimary: { backgroundColor: Colors.red },
  ctaSecondary: { borderWidth: 1.5, borderColor: Colors.ink },
  ctaText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  countdown: { fontFamily: fonts.display, fontSize: 16, color: gray.g06 },
});