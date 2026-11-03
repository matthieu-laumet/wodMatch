import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gray } from '@/constants/theme';

// ---- PLACEHOLDERS : à remplacer par l'API ----
const PROFILE = {
  name: 'Timon & Pumba',
  searching: '1 athlète (F) - Catégorie Inter',
  about:
    "On est une team niveau inter en quête d'une athlète féminine prête à tout donner sur le floor 🏋️ Si t'aimes transpirer, rigoler et soulever lourd dans la bonne humeur, rejoins-nous pour des WODs de feu et une ambiance 100% good vibes 😎🔥",
  competition: { name: 'Agen Showdown 2025', address: '8 AVENUE FRANCOIS MITTERRAND, 47550 BOE', dates: '25-26 Octobre 2025' },
  members: [
    { name: 'Matthieu LAUMET, 34 ans', box: 'CrossFit Pat' },
    { name: 'Pierre LEGOUX, 32 ans', box: 'CrossFit Pat' },
  ],
  strengths: ['T2B', 'Gymnastique', 'Rings', 'Handstand Walk', 'Muscle-ups', 'Handstand Push-up'],
  bets: ['Ergo', 'Run', 'Cardio', 'Worms', 'Dumbbell', 'Burpees', 'Squat Snatch'],
  goals: 'Passer un bon moment tous ensemble dans la bonne humeur. Se dépasser quelque soit le résultat',
};
// -----------------------------------------------

function Section({ icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name={icon} size={18} color={gray.g08} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Tags({ items, filled }: { items: string[]; filled?: boolean }) {
  return (
    <View style={s.tags}>
      {items.map(t => (
        <View key={t} style={[s.tag, filled && s.tagFilled]}>
          <Text style={s.tagText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ParticipantDetails() {
  const p = PROFILE;

  return (
    <View>
      <Section icon="search-outline" title="La team recherche">
        <Text style={s.bold}>{p.searching}</Text>
      </Section>

      <Section icon="chatbubble-ellipses-outline" title="À propos de la team">
        <Text style={s.body}>{p.about}</Text>
      </Section>

      <Section icon="barbell-outline" title="Le cœur du WOD">
        <View style={s.line}>
          <Ionicons name="location-outline" size={20} color={gray.g06} />
          <View style={{ flex: 1 }}>
            <Text style={s.body}>{p.competition.name}</Text>
            <Text style={s.small}>{p.competition.address}</Text>
          </View>
        </View>
        <View style={s.separator} />
        <View style={s.line}>
          <Ionicons name="calendar-outline" size={20} color={gray.g06} />
          <Text style={s.body}>{p.competition.dates}</Text>
        </View>
        <View style={s.separator} />
        {p.members.map(m => (
          <View key={m.name} style={[s.line, { marginBottom: 8 }]}>
            <Ionicons name="people-outline" size={20} color={gray.g06} />
            <View>
              <Text style={s.body}>{m.name}</Text>
              <Text style={s.small}>{m.box}</Text>
            </View>
          </View>
        ))}
      </Section>

      <Section icon="flash-outline" title="Les points forts de la team">
        <Tags items={p.strengths} filled />
      </Section>

      <Section icon="happy-outline" title="Là où ils/elles misent sur toi">
        <Tags items={p.bets} />
      </Section>

      <Section icon="locate-outline" title="Les objectifs pour cette compétition">
        <Text style={s.body}>{p.goals}</Text>
      </Section>

      <View style={s.actions}>
        <Pressable
          style={s.action}
          onPress={() => Share.share({ message: `Découvre ${p.name} sur WODMatch !` })}
        >
          <Text style={s.actionText}>Partager {p.name}</Text>
        </Pressable>
        <Pressable style={s.action} onPress={() => { /* TODO: bloquer */ }}>
          <Text style={s.actionText}>Bloquer {p.name}</Text>
        </Pressable>
        <Pressable style={s.action} onPress={() => { /* TODO: signaler */ }}>
          <Text style={[s.actionText, { color: '#E00000' }]}>Signaler {p.name}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: '7%',
    paddingVertical: 24,
    borderBottomWidth: 8,
    borderBottomColor: gray.g02, // même gris que tes autres séparateurs
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, marginBottom: 4, fontWeight: '600', color: gray.g08 },
  bold: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 16, color: '#222', lineHeight: 22 },
  small: { fontSize: 11, color: gray.g07, textTransform: 'uppercase' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  separator: { height: 1, backgroundColor: gray.g09, marginVertical: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#808080', backgroundColor: '#fff' },
  tagFilled: { borderWidth: 2, borderColor: '#130E0A', backgroundColor: '#F0F0F0' },
  tagText: { fontSize: 13 },
  actions: { gap: 2, marginBottom: 100, borderBottomWidth: 1, borderColor: gray.g04 },
  action: { backgroundColor: '#fff', paddingVertical: 16, alignItems: 'center' },
  actionText: { fontSize: 16, fontWeight: '600', color: '#555' },
});