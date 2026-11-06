import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, fonts } from '@/constants/theme';

/** Couleurs sémantiques du hub : rouge = like à traiter, vert = match. */
export const hub = { like: '#E4000F', match: '#16A34A', likeBg: '#FFF1F2', matchBg: '#ECFDF3', night: '#111111' };

export type Person = { name: string; photoUrl?: string | null };
type Kind = 'like' | 'match';

/** Avatar rond : anneau + badge (♥ rouge = like, ✓ vert = match). `surface` = couleur du fond derrière, pour détourer le badge. */
export function RingAvatar({ person, kind, size = 52, surface = Colors.white }: { person: Person; kind: Kind; size?: number; surface?: string }) {
  const color = kind === 'like' ? hub.like : hub.match;
  const badge = Math.round(size / 3) + 4;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${person.name}, ${kind === 'like' ? 'like à traiter' : 'match'}`}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
        {person.photoUrl ? (
          <Image source={{ uri: person.photoUrl }} style={styles.photo} />
        ) : (
          <Text style={[styles.initial, { fontSize: size / 3 }]}>{person.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2, backgroundColor: color, borderColor: surface }]}>
        <Text style={[styles.glyph, { fontSize: Math.round(badge * 0.55) }]}>{kind === 'like' ? '♥' : '✓'}</Text>
      </View>
    </View>
  );
}

export function AvatarRow({ people, kind, size = 52, max = 3, surface }: { people: Person[]; kind: Kind; size?: number; max?: number; surface?: string }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <View style={styles.avatarRow}>
      {shown.map((p, i) => <RingAvatar key={`${p.name}-${i}`} person={p} kind={kind} size={size} surface={surface} />)}
      {rest > 0 && (
        <View style={[styles.more, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={styles.moreText}>+{rest}</Text>
        </View>
      )}
    </View>
  );
}

/** Bandeau noir : total des likes (rouge) et des matchs (vert). */
export function SummaryBanner({ likes, matches }: { likes: number; matches: number }) {
  return (
    <View style={styles.banner}>
      <View style={[styles.bannerCol, styles.bannerSep]}>
        <Text style={[styles.bannerNum, { color: '#FF4B57' }]}>{likes}</Text>
        <Text style={styles.bannerLabel}>{likes > 1 ? 'likes à traiter' : 'like à traiter'}</Text>
      </View>
      <View style={styles.bannerCol}>
        <Text style={[styles.bannerNum, { color: '#4ADE80' }]}>{matches}</Text>
        <Text style={styles.bannerLabel}>{matches > 1 ? 'matchs en cours' : 'match en cours'}</Text>
      </View>
    </View>
  );
}

/** Bloc teinté : rose pour les likes, vert pour les matchs. */
export function StatusBlock({ kind, people, title, subtitle }: { kind: Kind; people: Person[]; title: string; subtitle?: string }) {
  const bg = kind === 'like' ? hub.likeBg : hub.matchBg;
  return (
    <View style={[styles.block, { backgroundColor: bg }]}>
      <AvatarRow people={people} kind={kind} size={kind === 'like' ? 56 : 48} surface={bg} />
      {/* <Text style={styles.blockTitle}>{title}</Text>
      {subtitle ? <Text style={styles.blockSub}>{subtitle}</Text> : null} */}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 3, backgroundColor: '#33393D', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  initial: { color: Colors.white, fontWeight: '700' },
  badge: { position: 'absolute', right: -4, bottom: -4, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  glyph: { color: Colors.white, fontWeight: '800' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  more: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#999', alignItems: 'center', justifyContent: 'center' },
  moreText: { fontWeight: '700', color: '#555' },
  banner: { flexDirection: 'row', backgroundColor: hub.night, borderRadius: 16, padding: 12, paddingLeft: 32, paddingTop: 0 },
  bannerCol: { flex: 1 },
  bannerSep: { borderRightWidth: 1, borderRightColor: '#333' },
  bannerNum: { fontFamily: fonts.display, fontSize: 48, fontWeight: '800', lineHeight: 68 },
  bannerLabel: { color: Colors.white, fontWeight: '700', fontSize: 12, },
  block: { borderRadius: 14, padding: 12, gap: 10 },
  blockTitle: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  blockSub: { fontSize: 12, color: '#555', marginTop: -6 },
});