import { useEffect, useState } from 'react';
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

const noop = () => {};

export default function EditProfile() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { user, updateUser } = useAuth();
  const { data, set } = useOnboarding();
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u: any = user;
    set({
      bio: u?.bio ?? '',
      funReps: u?.user_fun_reps ?? [],
      skills: u?.user_skills ?? [],
      levels: u?.user_levels ?? [],
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // ⚠️ À ADAPTER : vraie route de ton backend
      await api('/users/update-profil', {
        method: 'POST',
        body: JSON.stringify({
          bio: data.bio,
          levels: data.levels,
          skills: data.skills,
          userFunReps: data.funReps,
        }),
      });
      updateUser({
        bio: data.bio,
        user_levels: data.levels,
        user_skills: data.skills,
        user_fun_reps: data.funReps,
      } as any);
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
            <Text style={[styles.done, !canSave && { opacity: 0.4 }]}>Terminé</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Les podiums se construisent à plusieurs. Complète ton profil et trouve les partenaires qui vont te faire
          monter de niveau. 🥇
        </Text>

        <OnboardAboutMe variant="edit" setBtnText={noop} setIsDisabled={noop} />

        <View style={styles.section}>
          <OnboardSkills variant="edit" setBtnText={noop} setIsDisabled={noop} />
        </View>

        <View style={styles.section}>
          <OnboardLevel variant="edit" setBtnText={noop} setIsDisabled={noop} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: gray.g04,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  done: { fontSize: 16, fontWeight: '700', color: '#df0000' },
  content: { padding: 24, paddingTop: 16, paddingBottom: 48 },
  intro: { fontSize: 15, color: '#222', lineHeight: 22, marginBottom: 16 },
  section: { marginTop: 56 },
});