import { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';
import { MAX_BIO_LENGTH, MAX_FUNREP_LENGTH } from '../../constants/config';
import ConfirmSheet from '@/components/ConfirmSheet';
import { gray } from '@/constants/theme';

type FunRep = { id_fun_rep: number | null; label: string; description: string };
type Props = {
  setBtnText: (t: string) => void;
  setIsDisabled: (b: boolean) => void;
  variant?: 'onboarding' | 'edit';
};

export default function OnboardAboutMe({ setBtnText, setIsDisabled, variant = 'onboarding' }: Props) {
  const api = useWodmatchApi();
  const { data, set } = useOnboarding();
  const edit = variant === 'edit';
  const filled: FunRep[] = data.funReps ?? [];

  const [allFunReps, setAllFunReps] = useState<FunRep[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<FunRep | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null); // fun rep en attente de confirmation

  const [step, setStep] = useState<'list' | 'write'>('list');
  const [paneWidth, setPaneWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current; // 0 = liste, 1 = saisie
  const inputRef = useRef<TextInput>(null);

  const canSave = !!current?.description.trim();

  const goTo = (target: 'list' | 'write') => {
    setStep(target);
    Animated.timing(slide, {
      toValue: target === 'write' ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (target === 'write') inputRef.current?.focus();
    });
  };

  const pickRep = (fr: FunRep) => {
    setCurrent({
      id_fun_rep: fr.id_fun_rep,
      label: fr.label,
      description: filled.find(f => f.id_fun_rep === fr.id_fun_rep)?.description ?? '',
    });
    goTo('write');
  };

  const backToList = () => {
    Keyboard.dismiss();
    goTo('list');
  };

  const openModal = (fr?: FunRep) => {
    if (fr) {
      setCurrent(fr);
      setStep('write');
      slide.setValue(1);
      setTimeout(() => inputRef.current?.focus(), 350); // après l'ouverture de la modale
    } else {
      setCurrent({ id_fun_rep: null, label: '', description: '' });
      setStep('list');
      slide.setValue(0);
    }
    setOpen(true);
  };

  useEffect(() => {
    setBtnText('Suivant');
    api('/funReps/gets-all-funReps').then(setAllFunReps).catch(console.error);
  }, []);

  useEffect(() => {
    setIsDisabled(data.bio.trim().length === 0);
  }, [data.bio]);

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
  const confirmRemove = (id: number | null) => setPendingId(id);

  return (
    <View>
      {!edit && (
        <>
          <View style={styles.row}>
            <Text style={styles.title}>À propos de moi</Text>
            <Text style={styles.badge}>Important</Text>
          </View>
          <Text style={styles.text}>
            Montre ta grinta 💪 Explique aux teams pourquoi tu mérites une place parmi eux. C'est ton moment !
          </Text>
        </>
      )}

      <Text style={[styles.label, edit && styles.labelEdit]}>{edit ? "Ma bio d'athlète :" : 'Bio :'}</Text>
      <TextInput
        style={styles.textarea}
        multiline
        value={data.bio}
        onChangeText={t => t.length <= MAX_BIO_LENGTH && set({ bio: t })}
        placeholder="Parle-nous de toi et montre-nous ce qui te rend unique !"
        textAlignVertical="top"
      />
      <Text style={styles.counter}>{MAX_BIO_LENGTH - data.bio.length}</Text>

      <Text style={[styles.title, edit ? styles.sectionEdit : { marginTop: 16 }]}>
        {edit ? 'Fun Reps' : 'Fun reps'}
      </Text>
      {filled.length === 0 && <Text style={styles.text}>Fais la différence avec une anecdote</Text>}

      {filled.map(f => (
        <View key={f.id_fun_rep} style={{ marginTop: edit ? 16 : 10 }}>
          <Pressable style={[styles.card, { marginTop: 0 }]} onPress={() => openModal(f)}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTitleRow}>
                {edit && (
                  <MaterialCommunityIcons
                    name="kettlebell"
                    size={24}
                    color="#df0000"
                    style={{ transform: [{ rotate: '-16deg' }], marginTop: -4 }}
                  />
                )}
                <Text style={[styles.cardLabel, { flexShrink: 1 }, edit && { fontSize: 15 }]}>{f.label}</Text>
              </View>
              <Text style={[styles.cardDesc, edit && { paddingLeft: 30 }]}>{f.description}</Text>
            </View>

            {!edit && (
              <Pressable onPress={() => confirmRemove(f.id_fun_rep)} hitSlop={10}>
                <Text style={{ fontSize: 18 }}>✕</Text>
              </Pressable>
            )}
          </Pressable>

          {edit && (
            <Pressable style={styles.removeBadge} onPress={() => confirmRemove(f.id_fun_rep)} hitSlop={8}>
              <Ionicons name="close" size={16} color="#222" />
            </Pressable>
          )}
        </View>
      ))}

      <Pressable style={styles.addBtn} onPress={() => openModal()}>
        <Text style={styles.cardLabel}>Ajouter une fun rep sur moi</Text>
        <Text style={styles.cardDesc}>Sois drôle, c'est ton moment</Text>
        <View style={styles.plusBadge}>
          <Ionicons name="add" size={20} color="#fff" />
        </View>
      </Pressable>

      <ConfirmSheet
        visible={pendingId !== null}
        onCancel={() => setPendingId(null)}
        onConfirm={() => {
          remove(pendingId);
          setPendingId(null);
        }}
      />

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView edges={['bottom']} style={[styles.sheet, styles.sheetFull]}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Ajouter une Fun rep</Text>
              <Pressable style={styles.closeBtn} onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color="#222" />
              </Pressable>
            </View>

            {/* Zone qui glisse */}
            <View style={styles.panes} onLayout={e => setPaneWidth(e.nativeEvent.layout.width)}>
              {paneWidth > 0 && (
                <Animated.View
                  style={[
                    styles.track,
                    {
                      width: paneWidth * 2,
                      transform: [
                        { translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, -paneWidth] }) },
                      ],
                    },
                  ]}
                >
                  {/* Page 1 : liste */}
                  <View style={{ width: paneWidth }}>
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                      {allFunReps.map((fr, i) => (
                        <Pressable
                          key={fr.id_fun_rep}
                          onPress={() => pickRep(fr)}
                          style={[styles.listItem, i === allFunReps.length - 1 && { borderBottomWidth: 0 }]}
                        >
                          <Text style={styles.listText}>{fr.label}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Page 2 : saisie */}
                  <View style={{ width: paneWidth }}>
                    <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                      <Pressable style={styles.backRow} onPress={backToList} hitSlop={8}>
                        <Ionicons name="chevron-back" size={18} color="#222" />
                        <Text style={styles.backLabel}>{current?.label}</Text>
                      </Pressable>

                      <View style={styles.inputBox}>
                        <TextInput
                          ref={inputRef}
                          style={styles.funInput}
                          multiline
                          value={current?.description ?? ''}
                          onChangeText={d =>
                            d.length <= MAX_FUNREP_LENGTH && setCurrent(c => (c ? { ...c, description: d } : c))
                          }
                          placeholder="Sois drôle, on ne juge pas (ou presque)."
                          placeholderTextColor="#9aa0a6"
                          textAlignVertical="top"
                        />
                        <Text style={styles.funCounter}>
                          {MAX_FUNREP_LENGTH - (current?.description.length ?? 0)}
                        </Text>
                      </View>

                      <Pressable
                        style={[styles.addFunBtn, !canSave && styles.addFunBtnOff]}
                        onPress={save}
                        disabled={!canSave}
                      >
                        <Text style={styles.addFunBtnText}>Ajouter</Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                </Animated.View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panes: { flex: 1, overflow: 'hidden' },
  track: { flex: 1, flexDirection: 'row' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetFull: { height: '95%', maxHeight: '95%' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', minHeight: '60%',
  },
  sheetHeader: {
    paddingVertical: 18, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e5e5',
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  closeBtn: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  listItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  listText: { fontSize: 14, color: '#222' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backLabel: { fontSize: 14, fontWeight: '600', color: '#222', textDecorationLine: 'underline', flexShrink: 1 },
  inputBox: { borderWidth: 1, borderColor: '#d0d0d0', borderRadius: 10, padding: 12, minHeight: 130 },
  funInput: { fontSize: 15, color: '#222', minHeight: 90 },
  funCounter: { alignSelf: 'flex-end', fontSize: 12, color: '#9aa0a6' },
  addFunBtn: { backgroundColor: '#222', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  addFunBtnOff: { backgroundColor: '#8d8d8d' },
  addFunBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '600', color: '#222' },
  badge: {
    backgroundColor: '#cc0000', color: '#fff', fontSize: 14, fontWeight: '700', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 6, overflow: 'hidden',
  },
  text: { fontSize: 16, color: '#222', marginVertical: 8 },
  label: { fontSize: 16, fontWeight: '700', color: '#222', marginTop: 16, marginBottom: 8 },
  textarea: {
    borderWidth: 2, borderColor: '#9aa0a6', borderRadius: 10, padding: 12, minHeight: 180, fontSize: 16,
    color: '#222', backgroundColor: '#fff',
  },
  counter: { alignSelf: 'flex-end', color: '#777', marginTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#9aa0a6', marginTop: 10, backgroundColor: '#fff',
  },
  cardLabel: { fontWeight: '700', fontSize: 16, color: '#222' },
  cardDesc: { color: '#555', marginTop: 2 },
  addBtn: {
    padding: 16, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#9aa0a6', marginTop: 24,
    alignItems: 'center', backgroundColor: '#eceaea',
  },
  plusBadge: {
    position: 'absolute', top: -16, right: -10, width: 32, height: 32, borderRadius: 999,
    backgroundColor: '#cc0000', alignItems: 'center', justifyContent: 'center',
  },

  // --- variante édition ---
  labelEdit: { fontSize: 18, marginTop: 8 },
  sectionEdit: { fontSize: 18, fontWeight: '700', marginTop: 40 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  removeBadge: {
    position: 'absolute', top: -12, right: -8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: gray.g07, alignItems: 'center', justifyContent: 'center',
  },
});