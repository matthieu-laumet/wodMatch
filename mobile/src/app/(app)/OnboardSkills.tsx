import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';
import { MAX_SELECTIONS_Skills } from '../../constants/config';
import { gray } from '@/constants/theme';

type Skill = { id_skill: number; label: string };
type Props = {
  setBtnText: (t: string) => void;
  setIsDisabled: (b: boolean) => void;
  variant?: 'onboarding' | 'edit';
};
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const toggleIn = (list: Skill[], skill: Skill) => {
  if (list.some(s => s.id_skill === skill.id_skill)) return list.filter(s => s.id_skill !== skill.id_skill);
  return list.length < MAX_SELECTIONS_Skills ? [...list, skill] : list;
};

// Recherche + liste de tags (utilisé par l'onboarding et par la modale d'édition)
function Picker({ skills, loading, selected, onToggle }: {
  skills: Skill[]; loading: boolean; selected: Skill[]; onToggle: (s: Skill) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = skills.filter(s => normalize(s.label).includes(normalize(search)));

  return (
    <>
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
              <Pressable key={skill.id_skill} onPress={() => onToggle(skill)} style={[styles.tag, on && styles.tagOn]}>
                <Text style={[styles.tagText, on && { color: '#fff' }]}>{skill.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}

export default function OnboardSkills({ setBtnText, setIsDisabled, variant = 'onboarding' }: Props) {
  const api = useWodmatchApi();
  const { data, set } = useOnboarding();
  const edit = variant === 'edit';
  const selected: Skill[] = data.skills ?? [];
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Skill[]>([]);

  useEffect(() => {
    api('/skills/gets-all-skills').then(setSkills).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setBtnText(`Suivant (${selected.length}/${MAX_SELECTIONS_Skills})`);
    setIsDisabled(selected.length === 0);
  }, [selected.length]);

  const openModal = () => {
    setDraft(selected);
    setOpen(true);
  };
  const validate = () => {
    set({ skills: draft });
    setOpen(false);
  };

  // ---------- Onboarding ----------
  if (!edit) {
    return (
      <View>
        <View style={styles.head}>
          <Text style={styles.title}>Quels sont tes points forts ?</Text>
          <Text>({selected.length}/{MAX_SELECTIONS_Skills})</Text>
        </View>
        <Text style={styles.text}>
          On a tous nos mouvements préférés, ceux dans lesquels on excelle. Partage-les avec les autres.
        </Text>
        <Picker skills={skills} loading={loading} selected={selected} onToggle={s => set({ skills: toggleIn(selected, s) })} />
      </View>
    );
  }

  // ---------- Édition ----------
  return (
    <View>
      <Text style={styles.sectionEdit}>Tes Skills</Text>

      <View style={styles.editRow}>
        <Pressable style={styles.editTags} onPress={openModal}>
          {selected.length === 0 && <Text style={styles.empty}>Choisis tes points forts</Text>}
          {selected.map(s => (
            <View key={s.id_skill} style={styles.tagSmall}>
              <Text style={styles.tagSmallText}>{s.label}</Text>
            </View>
          ))}
        </Pressable>
        <Pressable style={styles.plusBadge} onPress={openModal} hitSlop={8}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Modifier mes skills</Text>
              <Pressable style={styles.closeBtn} onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color="#222" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
              <Text style={styles.counter}>({draft.length}/{MAX_SELECTIONS_Skills})</Text>
              <Picker
                skills={skills} loading={loading} selected={draft}
                onToggle={s => setDraft(d => toggleIn(d, s))}
              />
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable
                style={[styles.validateBtn, draft.length === 0 && { opacity: 0.4 }]}
                disabled={draft.length === 0}
                onPress={validate}
              >
                <Text style={styles.validateText}>Valider</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: '#222', flex: 1 },
  text: { fontSize: 16, color: '#222', marginVertical: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#9aa0a6',
    borderRadius: 8, paddingHorizontal: 12, marginVertical: 12, gap: 8, backgroundColor: '#fff',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  empty: { textAlign: 'center', color: '#626469', fontSize: 15, marginTop: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 8, rowGap: 10, marginTop: 12 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#ccc', backgroundColor: '#fff' },
  tagOn: { backgroundColor: '#222', borderColor: '#222' },
  tagText: { fontSize: 15, color: '#222' },

  // --- variante édition ---
  sectionEdit: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editTags: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagSmall: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: gray.g06, backgroundColor: '#fff' },
  tagSmallText: { fontSize: 13, fontWeight: '500', color: '#222' },
  plusBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#df0000', alignItems: 'center', justifyContent: 'center',
  },

  // --- modale ---
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '95%' },
  sheetHeader: {
    paddingVertical: 18, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e5e5',
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  closeBtn: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  counter: { alignSelf: 'flex-end', color: '#777' },
  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e5e5' },
  validateBtn: { backgroundColor: '#222', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  validateText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});