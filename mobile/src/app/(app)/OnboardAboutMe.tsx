import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';
import { MAX_BIO_LENGTH } from '../../constants/config';

type FunRep = { id_fun_rep: number | null; label: string; description: string };
type Props = { setBtnText: (t: string) => void; setIsDisabled: (b: boolean) => void };

export default function OnboardAboutMe({ setBtnText, setIsDisabled }: Props) {
  const api = useWodmatchApi();
  const { data, set } = useOnboarding();
  const filled: FunRep[] = data.funReps ?? [];

  const [allFunReps, setAllFunReps] = useState<FunRep[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<FunRep | null>(null);

  useEffect(() => {
    setBtnText('Suivant');
    api('/funReps/gets-all-funReps').then(setAllFunReps).catch(console.error);
  }, []);

  useEffect(() => {
    setIsDisabled(data.bio.trim().length === 0);
  }, [data.bio]);

  const openModal = (fr?: FunRep) => {
    setCurrent(fr ?? { id_fun_rep: null, label: '', description: '' });
    setOpen(true);
  };

  const save = () => {
    if (!current || current.id_fun_rep === null || !current.description.trim()) return;
    const exists = filled.some(f => f.id_fun_rep === current.id_fun_rep);
    set({
      funReps: exists
        ? filled.map(f => (f.id_fun_rep === current.id_fun_rep ? current : f))
        : [...filled, current],
    });
    setOpen(false);
  };

  const remove = (id: number | null) => set({ funReps: filled.filter(f => f.id_fun_rep !== id) });

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.title}>À propos de moi</Text>
        <Text style={styles.badge}>Important</Text>
      </View>
      <Text style={styles.text}>
        Montre ta grinta 💪 Explique aux teams pourquoi tu mérites une place parmi eux. C'est ton moment !
      </Text>

      <Text style={styles.label}>Bio :</Text>
      <TextInput
        style={styles.textarea}
        multiline
        value={data.bio}
        onChangeText={t => t.length <= MAX_BIO_LENGTH && set({ bio: t })}
        placeholder="Parle-nous de toi ! Avec moi c'est un podium assuré..."
        textAlignVertical="top"
      />
      <Text style={styles.counter}>{MAX_BIO_LENGTH - data.bio.length}</Text>

      <Text style={[styles.title, { marginTop: 32 }]}>Fun reps</Text>
      {filled.length === 0 && <Text style={styles.text}>Fais la différence avec une anecdote</Text>}
      {filled.map(f => (
        <Pressable key={f.id_fun_rep} style={styles.card} onPress={() => openModal(f)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{f.label}</Text>
            <Text style={styles.cardDesc}>{f.description}</Text>
          </View>
          <Pressable onPress={() => remove(f.id_fun_rep)} hitSlop={10}>
            <Text style={{ fontSize: 18 }}>✕</Text>
          </Pressable>
        </Pressable>
      ))}
      <Pressable style={styles.addBtn} onPress={() => openModal()}>
        <Text style={styles.cardLabel}>Ajouter une fun rep sur moi</Text>
        <Text style={styles.cardDesc}>Sois drôle, c'est ton moment</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Ajouter une Fun rep</Text>
            <View style={styles.chips}>
              {allFunReps.map(fr => {
                const on = current?.id_fun_rep === fr.id_fun_rep;
                return (
                  <Pressable
                    key={fr.id_fun_rep}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() =>
                      setCurrent(c => ({
                        id_fun_rep: fr.id_fun_rep,
                        label: fr.label,
                        description: filled.find(f => f.id_fun_rep === fr.id_fun_rep)?.description ?? c?.description ?? '',
                      }))
                    }
                  >
                    <Text style={{ color: on ? '#fff' : '#222' }}>{fr.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={styles.textarea}
              multiline
              value={current?.description ?? ''}
              onChangeText={d => setCurrent(c => (c ? { ...c, description: d } : c))}
              placeholder="Ta réponse..."
              textAlignVertical="top"
            />
            <Pressable style={styles.ok} onPress={save}>
              <Text style={styles.okText}>OK</Text>
            </Pressable>
            <Pressable onPress={() => setOpen(false)} style={{ alignItems: 'center', marginTop: 16 }}>
              <Text>Annuler</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '600', color: '#222' },
  badge: { backgroundColor: '#cc0000', color: '#fff', fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  text: { fontSize: 16, color: '#222', marginVertical: 8 },
  label: { fontSize: 16, fontWeight: '700', color: '#222', marginTop: 16, marginBottom: 8 },
  textarea: { borderWidth: 1, borderColor: '#9aa0a6', borderRadius: 8, padding: 12, minHeight: 120, fontSize: 16, color: '#222' },
  counter: { alignSelf: 'flex-end', color: '#777', marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#222', marginTop: 10 },
  cardLabel: { fontWeight: '700', fontSize: 16, color: '#222' },
  cardDesc: { color: '#555', marginTop: 2 },
  addBtn: { padding: 16, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#505050', marginTop: 12, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#ccc' },
  chipOn: { backgroundColor: '#222', borderColor: '#222' },
  ok: { backgroundColor: '#222', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  okText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});