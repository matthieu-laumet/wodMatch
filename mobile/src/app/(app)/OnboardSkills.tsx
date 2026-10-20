import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';
import { MAX_SELECTIONS_Skills } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';

type Skill = { id_skill: number; label: string };
type Props = { setBtnText: (t: string) => void; setIsDisabled: (b: boolean) => void };
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function OnboardSkills({ setBtnText, setIsDisabled }: Props) {
  const api = useWodmatchApi();
  const { data, set } = useOnboarding();
  const selected: Skill[] = data.skills ?? [];
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api('/skills/gets-all-skills').then(setSkills).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setBtnText(`Suivant (${selected.length}/${MAX_SELECTIONS_Skills})`);
    setIsDisabled(selected.length === 0);
  }, [selected.length]);

  const toggle = (skill: Skill) => {
    const exists = selected.some(s => s.id_skill === skill.id_skill);
    if (exists) set({ skills: selected.filter(s => s.id_skill !== skill.id_skill) });
    else if (selected.length < MAX_SELECTIONS_Skills) set({ skills: [...selected, skill] });
  };

  const filtered = skills.filter(s => normalize(s.label).includes(normalize(search)));

  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Quels sont tes points forts ?</Text>
        <Text>({selected.length}/{MAX_SELECTIONS_Skills})</Text>
      </View>
      <Text style={styles.text}>
        On a tous nos mouvements préférés, ceux dans lesquels on excelle. Partage-les avec les autres.
      </Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#949696" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un skill..."
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10}>
            <Ionicons name="close" size={20} color="#949696" />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#222" style={{ marginTop: 24 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>
          {search.trim()
            ? `No rep ! Aucun skill ne correspond à « ${search.trim()} »`
            : 'Aucun skill disponible pour le moment'}
        </Text>
      ) : (
        <View style={styles.tags}>
          {filtered.map(skill => {
            const on = selected.some(s => s.id_skill === skill.id_skill);
            return (
              <Pressable key={skill.id_skill} onPress={() => toggle(skill)} style={[styles.tag, on && styles.tagOn]}>
                <Text style={[styles.tagText, on && { color: '#fff' }]}>{skill.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#9aa0a6',
    borderRadius: 8, paddingHorizontal: 12, marginVertical: 12, gap: 8, backgroundColor: '#fff'
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  title: { fontSize: 24, fontWeight: '600', color: '#222', flex: 1 },
  empty: { textAlign: 'center', color: '#626469', fontSize: 15, marginTop: 24 },
  text: { fontSize: 16, color: '#222', marginVertical: 8 },
  search: { borderWidth: 1, borderColor: '#9aa0a6', borderRadius: 8, padding: 12, fontSize: 16, marginVertical: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 8, rowGap: 10, marginTop: 12 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#ccc', backgroundColor: '#fff' },
  tagOn: { backgroundColor: '#222', borderColor: '#222' },
  tagText: { fontSize: 15, color: '#222' },
});