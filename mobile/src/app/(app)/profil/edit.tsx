import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useWodmatchApi } from '@/lib/api';
import { gray } from '@/constants/theme';
import OnboardAboutMe from '../OnboardAboutMe';
import OnboardSkills from '../OnboardSkills';
import OnboardLevel from '../OnboardLevel';
import { useNavigation } from 'expo-router';
import ConfirmSheet from '@/components/ConfirmSheet';
import { setLeaveGuard } from '@/lib/leaveGuard';

const noop = () => {};

export default function EditProfile() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { user, updateUser } = useAuth();
  const { data, set } = useOnboarding();
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingGo, setPendingGo] = useState<(() => void) | null>(null);
  const navigation = useNavigation();
  const [leaveEvent, setLeaveEvent] = useState<any>(null); // navigation en attente de confirmation
  const saved = useRef(false); // true une fois enregistré : on ne bloque plus

  const initial = useRef<any>(null);    

  useEffect(() => {
    const u: any = user;
    initial.current = {
      skills: u?.user_skills ?? [],
      funReps: u?.user_fun_reps ?? [],
    };
    set({
      bio: u?.bio ?? '',
      funReps: u?.user_fun_reps ?? [],
      skills: u?.user_skills ?? [],
      levels: u?.user_levels ?? [],
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const isDirty = () => {
    if (!initial.current) return false;
    const ids = (list: any[]) => list.map(s => s.id_skill).sort().join(',');
    const levels = (list: any[]) => list.map(l => l.id_level).sort().join(',');
    const reps = (list: any[]) => list.map(f => `${f.id_fun_rep}:${f.description}`).sort().join('|');
    const u: any = user;
    return (
      data.bio !== (u?.bio ?? '') ||
      ids(data.skills) !== ids(initial.current.skills) ||
      levels(data.levels) !== levels(u?.user_levels ?? []) ||
      reps(data.funReps) !== reps(initial.current.funReps)
    );
  };

  // bloque la sortie si des changements ne sont pas enregistrés
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e: any) => {
      if (saved.current || !isDirty()) return;
      e.preventDefault();
      setLeaveEvent(e);
    });
  }, [navigation, data, user]);


  useEffect(() => {
    setLeaveGuard(go => {
      if (saved.current || !isDirty()) go();
      else setPendingGo(() => go); // on garde la navigation en attente
    });
    return () => setLeaveGuard(null);
  }, [data, user]);


  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // 1. Bio + niveaux
      await api('/users/update-user-prolfil', {
        method: 'POST',
        body: JSON.stringify({ bio: data.bio, levels: data.levels }),
      });

      // 2. Skills, seulement si la sélection a changé
      const ids = (list: any[]) => list.map(s => s.id_skill).sort().join(',');
      if (ids(data.skills) !== ids(initial.current.skills)) {
        await api('/skills/clean-upsert-user-skills', {
          method: 'POST',
          body: JSON.stringify({ skills: data.skills }),
        });
      }

      // 3. Fun reps : suppressions, puis ajouts / modifications
      const before: any[] = initial.current.funReps;
      const after: any[] = data.funReps;

      for (const old of before) {
        if (!after.some(f => f.id_fun_rep === old.id_fun_rep)) {
          await api(`/funReps/delete-user-fun-rep/${old.id_fun_rep}`, { method: 'DELETE' });
        }
      }
      for (const rep of after) {
        const old = before.find(f => f.id_fun_rep === rep.id_fun_rep);
        if (old && old.description === rep.description) continue; // inchangée
        await api('/funReps/upsert-user-fun-reps', {
          method: 'POST',
          body: JSON.stringify({ oldRepId: old ? old.id_fun_rep : null, newFunRep: rep }),
        });
      }

      updateUser({
        bio: data.bio,
        user_levels: data.levels,
        user_skills: data.skills,
        user_fun_reps: data.funReps,
      } as any);
      saved.current = true;
      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated) return <ActivityIndicator style={{ flex: 1 }} color="#222" />;

  const canSave = !saving && data.bio.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: gray.g01 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modifier mes informations</Text>
        <Pressable onPress={save} disabled={!canSave} hitSlop={10}>
          {saving ? (
            <ActivityIndicator color="#df0000" />
          ) : (
            <Text style={[styles.done, !canSave && { opacity: 0.4, color: gray.g09 }]}>Terminé</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Les podiums se construisent à plusieurs. Complète ton profil et trouve les partenaires qui vont te faire
          monter de niveau.
        </Text>

        <OnboardAboutMe variant="edit" setBtnText={noop} setIsDisabled={noop} />

        <View style={styles.section}>
          <OnboardSkills variant="edit" setBtnText={noop} setIsDisabled={noop} />
        </View>

        <View style={styles.section}>
          <OnboardLevel variant="edit" setBtnText={noop} setIsDisabled={noop} />
        </View>
      </ScrollView>
      <ConfirmSheet
        visible={!!leaveEvent}
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer à modifier"
        onCancel={() => setLeaveEvent(null)}
        onConfirm={() => {
          const e = leaveEvent;
          setLeaveEvent(null);
          saved.current = true; // on laisse passer la navigation
          navigation.dispatch(e.data.action);
        }}
      />
      <ConfirmSheet
        visible={!!pendingGo}
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer à modifier"
        onCancel={() => setPendingGo(null)}
        onConfirm={() => {
          const go = pendingGo;
          setPendingGo(null);
          saved.current = true; // on laisse passer
          go?.();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: gray.g07,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  done: { fontSize: 16, fontWeight: '700', color: '#df0000' },
  content: { padding: 24, paddingTop: 16, paddingBottom: 48 },
  intro: { fontSize: 15, color: '#222', lineHeight: 22, marginBottom: 16 },
  section: { marginTop: 56 },
});