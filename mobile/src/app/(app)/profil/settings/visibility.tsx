import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useWodzoneApi } from '@/lib/api';
import Avatar from '@/components/Avatar';
import { gray } from '@/constants/theme';

type Club = { label: string; value: number };
type Section = '' | 'visibility' | 'box';

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// exemple affiché sous les réglages (comme sur le web)
const EXAMPLES = [
  { name: 'HOPPER Jayson', club: 'CrossFit Crash', avatar: 'https://profilepicsbucket.crossfit.com/da4cc-P1020449_8-184.jpg' },
  { name: 'MEDEIROS Justin', club: 'CrossFit Fort Vancouver', avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=JustinMEDEIROS' },
  { name: 'TOOMEY Tia-Clair', club: 'CrossFit PRVN', avatar: 'https://profilepicsbucket.crossfit.com/f1d92-P163097_5-184.jpg' },
];

function Radio({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.radio} onPress={onPress} hitSlop={6}>
      <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? '#000' : gray.g07} />
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

type BlockProps = {
  label: string;
  value: string;
  active: boolean;
  onToggle: () => void;
  explanation: string;
  onSave: () => void;
  saving: boolean;
  canSave?: boolean;
  children: React.ReactNode;
};

function Block({ label, value, active, onToggle, explanation, onSave, saving, canSave = true, children }: BlockProps) {
  return (
    <View style={[styles.block, active && { borderColor: '#000' }]}>
      <View style={styles.blockHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockLabel}>{label}</Text>
          {!active && <Text style={styles.blockValue}>{value}</Text>}
        </View>
        <Pressable onPress={onToggle} hitSlop={10}>
          <Text style={styles.edit}>{active ? 'Annuler' : 'modifier'}</Text>
        </Pressable>
      </View>

      {active && (
        <View style={styles.blockBody}>
          <Text style={styles.explanation}>{explanation}</Text>
          {children}
          <Pressable
            style={[styles.save, (!canSave || saving) && { opacity: 0.5 }]}
            onPress={onSave}
            disabled={!canSave || saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Enregistrer</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function Visibility() {
  const router = useRouter();
  const api = useWodzoneApi();
  const { user, updateUser } = useAuth();
  const u: any = user;

  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);

  // valeurs enregistrées
  const [visible, setVisible] = useState(!u?.is_not_visible);
  const [boxes, setBoxes] = useState<Club[]>([]); // vide = tout le monde

  // brouillons (section ouverte)
  const [active, setActive] = useState<Section>('');
  const [saving, setSaving] = useState(false);
  const [dVisible, setDVisible] = useState(true);
  const [dChoice, setDChoice] = useState<'all' | 'some'>('all');
  const [dBoxes, setDBoxes] = useState<Club[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api('/users/get-user-box-visibilities'), api('/clubs')])
      .then(([userBoxes, allClubs]) => {
        setBoxes(
          (Array.isArray(userBoxes) ? userBoxes : []).map((b: any) => ({
            label: b.label ?? b.name,
            value: b.value ?? b.id_club,
          })),
        );
        // on retire les id <= 0 et les doublons de nom, comme sur le web
        const seen = new Set<string>();
        const list: Club[] = [];
        (Array.isArray(allClubs) ? allClubs : [])
          .filter((c: any) => c.id_club > 0)
          .forEach((c: any) => {
            if (seen.has(c.name)) return;
            seen.add(c.name);
            list.push({ label: c.name, value: c.id_club });
          });
        setClubs(list);
      })
      .catch(e => Alert.alert('Erreur', e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (section: Section) => {
    if (active === section) return setActive('');
    setDVisible(visible);
    setDChoice(boxes.length > 0 ? 'some' : 'all');
    setDBoxes(boxes);
    setSearch('');
    setActive(section);
  };

  const saveVisibility = async () => {
    setSaving(true);
    try {
      await api('/users/upsert-visibility', {
        method: 'POST',
        body: JSON.stringify({ is_not_visible: !dVisible }),
      });
      setVisible(dVisible);
      updateUser({ is_not_visible: !dVisible } as any);
      setActive('');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBoxes = async () => {
    const some = dChoice === 'some';
    const list = some ? dBoxes : [];
    setSaving(true);
    try {
      await api('/users/update-user-box-visibilities', {
        method: 'PUT',
        body: JSON.stringify({ select_box: list, box_choice: some }),
      });
      setBoxes(list);
      setActive('');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const suggestions = search.trim()
    ? clubs
        .filter(c => !dBoxes.some(b => b.value === c.value) && normalize(c.label).includes(normalize(search)))
        .slice(0, 20)
    : [];

  return (
    <ScrollView style={{ backgroundColor: gray.g01 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="arrow-back-circle-outline" size={34} color="#222" />
      </Pressable>

      <Text style={styles.title}>Gérer ma visibilité</Text>
      <Text style={styles.text}>
        Choisis qui peut te voir dans la liste des athletes — tout le monde, personne, ou uniquement les membres de tes
        box. Valable aussi pour WodZone®
      </Text>

      {loading ? (
        <ActivityIndicator color={gray.g085} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={{ marginTop: 28 }}>
            <Block
              label="Visibilité de mon profil"
              value={visible ? "Oui, j'accepte" : 'Non, je refuse'}
              active={active === 'visibility'}
              onToggle={() => toggle('visibility')}
              explanation="Indiquez si vous souhaitez être visible dans la liste des athlètes. Exemple ci-dessous."
              onSave={saveVisibility}
              saving={saving}
            >
              <Radio label="Oui" on={dVisible} onPress={() => setDVisible(true)} />
              <Radio label="Non" on={!dVisible} onPress={() => setDVisible(false)} />
            </Block>
          </View>

          {visible && (
            <View style={{ marginTop: 24 }}>
              <Block
                label="Qui peut voir mon profil"
                value={boxes.length === 0 ? 'Tout le monde' : boxes.map(b => b.label).join(', ')}
                active={active === 'box'}
                onToggle={() => toggle('box')}
                explanation="Votre profil sera visible uniquement par les athlètes des box que vous sélectionnez ou par tout le monde."
                onSave={saveBoxes}
                saving={saving}
                canSave={dChoice === 'all' || dBoxes.length > 0}
              >
                <Radio label="Tout le monde" on={dChoice === 'all'} onPress={() => setDChoice('all')} />
                <Radio label="Quelques box" on={dChoice === 'some'} onPress={() => setDChoice('some')} />

                {dChoice === 'some' && (
                  <View style={{ marginTop: 8 }}>
                    {dBoxes.length > 0 && (
                      <View style={styles.chips}>
                        {dBoxes.map(b => (
                          <Pressable
                            key={b.value}
                            style={styles.chip}
                            onPress={() => setDBoxes(list => list.filter(x => x.value !== b.value))}
                          >
                            <Text style={styles.chipText}>{b.label}</Text>
                            <Ionicons name="close" size={14} color="#fff" />
                          </Pressable>
                        ))}
                      </View>
                    )}

                    <View style={styles.searchBox}>
                      <Ionicons name="search" size={20} color="#949696" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Tapez le nom de la box"
                        value={search}
                        onChangeText={setSearch}
                        autoCorrect={false}
                      />
                    </View>

                    {search.trim().length > 0 && (
                      <View style={styles.results}>
                        {suggestions.length === 0 ? (
                          <Text style={styles.empty}>Aucune option trouvée</Text>
                        ) : (
                          suggestions.map(c => (
                            <Pressable
                              key={c.value}
                              style={styles.option}
                              onPress={() => {
                                setDBoxes(list => [...list, c]);
                                setSearch('');
                              }}
                            >
                              <Text style={styles.optionText}>{c.label}</Text>
                            </Pressable>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                )}
              </Block>
            </View>
          )}

          {/* Exemple */}
          <Text style={styles.exampleTitle}>Exemple</Text>
          <View style={styles.example}>
            {EXAMPLES.map(a => (
              <View key={a.name} style={styles.exampleRow}>
                <Avatar uri={a.avatar} name={a.name} size={40} />
                <View>
                  <Text style={styles.exName}>{a.name}</Text>
                  <Text style={styles.exClub}>{a.club}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '600', color: '#222', marginTop: 8, marginBottom: 8 },
  text: { fontSize: 15, color: '#222', lineHeight: 22 },

  block: { backgroundColor: '#fff', borderWidth: 1, borderColor: gray.g06, borderRadius: 10, overflow: 'hidden' },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  blockLabel: { fontSize: 15, fontWeight: '700', color: '#222' },
  blockValue: { fontSize: 14, color: gray.g08, marginTop: 4 },
  edit: { fontSize: 14, fontWeight: '700', color: '#222', textDecorationLine: 'underline' },
  blockBody: { paddingHorizontal: 16, paddingBottom: 16 },
  explanation: { fontSize: 14, color: gray.g07, marginBottom: 12, lineHeight: 20 },
  save: { backgroundColor: '#000', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  radio: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  radioLabel: { fontSize: 15, color: '#222', fontWeight: '500' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#222',
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '500' },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: gray.g06,
    borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  results: { marginTop: 8, borderWidth: 1, borderColor: gray.g06, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' },
  option: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: gray.g05 },
  optionText: { fontSize: 15, color: '#222' },
  empty: { padding: 16, textAlign: 'center', color: gray.g08 },

  exampleTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginTop: 32, marginBottom: 8 },
  example: { backgroundColor: '#fff', borderWidth: 1, borderColor: gray.g06, borderRadius: 10, padding: 8 },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 },
  exName: { fontSize: 15, fontWeight: '600', color: '#222' },
  exClub: { fontSize: 13, color: gray.g08 },
});