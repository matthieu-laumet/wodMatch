import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gray } from '@/constants/theme';
import { TeamProfile } from '@/types/competition';
import { searchingText } from '@/lib/team';
import { convertDateEvent } from '@/utils/date.transform';

type Props = {
  profile: TeamProfile;
  competition: { name: string; address?: string | null; dates?: string | null, begin: string, end: string };
};


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

export default function ParticipantDetails({ profile: p, competition }: Props) {
  const searching = p.searching.length ? searchingText(p.searching) : 'Team complète';
  const category = p.division.name ? ` - Catégorie ${p.division.name}` : '';

  return (
    <View>
      <Section icon="search-outline" title="La team recherche">
        <Text style={s.bold}>{searching}{category}</Text>
      </Section>

      <Section icon="chatbubble-ellipses-outline" title="À propos de la team">
        <Text style={s.body}>{p.bio}</Text>
      </Section>

      <Section icon="barbell-outline" title="Le cœur du WOD">
        <View style={s.line}>
          <Ionicons name="location-outline" size={20} color={gray.g06} />
          <View style={{ flex: 1 }}>
            <Text style={s.body}>{competition.name}</Text>
            {!!competition.address && <Text style={s.small}>{competition.address}</Text>}
          </View>
        </View>
        <View style={s.separator} />
        <View style={s.line}>
          <Ionicons name="calendar-outline" size={20} color={gray.g06} />
          <Text style={s.body}>{convertDateEvent(competition.begin, competition.end, true)}</Text>
        </View>
        <View style={s.separator} />
        {p.members.map(m => (
          <View key={m.id_user} style={[s.line, { marginBottom: 8 }]}>
            <Ionicons name="people-outline" size={20} color={gray.g06} />
            <View>
              <Text style={s.body}>
                {[m.first_name, m.last_name].filter(Boolean).join(' ')}
                {m.age != null ? `, ${m.age} ans` : ''}
              </Text>
              {!!m.club_name && <Text style={s.small}>{m.club_name}</Text>}
            </View>
          </View>
        ))}
      </Section>

      {p.skills.length > 0 && (
        <Section icon="flash-outline" title="Les points forts de la team">
          <Tags items={p.skills} filled />
        </Section>
      )}

      {p.objective_skills?.length > 0 && (
        <Section icon="star-outline" title="Là où ils/elles misent sur toi">
          <Tags items={p.objective_skills} filled />
        </Section>
      )}

      {p.fun_reps.length > 0 && (
        <Section icon="happy-outline" title="Fun facts sur la team">
          {p.fun_reps.map((f, i) => (
            <View key={f.label}>
              {i > 0 && <View style={s.separator} />}
              <Text style={s.bold}>{f.label}</Text>
              <Text style={s.body}>{f.description}</Text>
            </View>
          ))}
        </Section>
      )}

      {!!p.objective && (
        <Section icon="locate-outline" title="Les objectifs pour cette compétition">
          <Text style={s.body}>{p.objective}</Text>
        </Section>
      )}

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