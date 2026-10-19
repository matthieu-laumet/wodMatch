import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useWodmatchApi } from '../../lib/api';
import HandlePhotos from '@/components/HandlePhotos';
import OnboardSkills from './OnboardSkills';
import OnboardAboutMe from './OnboardAboutMe';
import OnboardLevel from './OnboardLevel';

type StepProps = { setBtnText: (t: string) => void; setIsDisabled: (b: boolean) => void };

// Écran temporaire, à remplacer par OnboardSkills / OnboardAboutMe / OnboardLevel
const Todo = ({ name, setBtnText, setIsDisabled }: StepProps & { name: string }) => {
  useEffect(() => { setBtnText('Suivant'); setIsDisabled(false); }, []);
  return <Text style={{ fontSize: 18, marginTop: 24 }}>{name} (à faire)</Text>;
};

export default function Onboarding() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { updateUser } = useAuth();
  const { data, reset } = useOnboarding();

  const [section, setSection] = useState(0);
  const [btnText, setBtnText] = useState('Suivant');
  const [isDisabled, setIsDisabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handlePrev = () => {
    if (section === 0) return router.replace('/welcome');
    setSection(s => s - 1);
  };

  const handleNext = async () => {
    if (isDisabled || submitting) return;
    if (section === 3) return submit();
    setSection(s => s + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await api('/users/onboarding-user', {
        method: 'POST',
        body: JSON.stringify({
          levels: data.levels,
          userBio: data.bio,
          userFunReps: data.funReps,
          skills: data.skills,
          userSearchMode: data.searchMode,
        }),
      });
      updateUser({ has_seen_wodmatch_welcome: result.has_seen_wodmatch_welcome });
      reset();
      router.replace('/'); // le web va sur /profil : adapte selon tes routes
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const step: StepProps = { setBtnText, setIsDisabled };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={handlePrev} hitSlop={10}>
            <Ionicons name="arrow-back-circle-outline" size={34} color="#222" />
          </Pressable>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${((section + 1) / 4) * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {section === 0 && <HandlePhotos {...step} />}
          {section === 1 && <OnboardSkills {...step} />}
          {section === 2 && <OnboardAboutMe {...step} />}
          {section === 3 && <OnboardLevel {...step} />}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.btn, (isDisabled || submitting) && { opacity: 0.4 }]}
            onPress={handleNext}
            disabled={isDisabled || submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{btnText}</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 12 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden' },
  bar: { height: 6, backgroundColor: '#222' },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  footer: { padding: 24, paddingTop: 8 },
  btn: { backgroundColor: '#222', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 17 },
});