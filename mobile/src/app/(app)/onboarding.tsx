import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useWodmatchApi } from '../../lib/api';
import HandlePhotos from '@/components/HandlePhotos';
import OnboardSkills from './OnboardSkills';
import OnboardAboutMe from './OnboardAboutMe';
import OnboardLevel from './OnboardLevel';

const SECTION_KEY = 'onboardSection';
const ACTIVE_KEY = 'onboardActive';

type StepProps = { setBtnText: (t: string) => void; setIsDisabled: (b: boolean) => void };

// Props "vides" pour l'étape qui sort : elle ne doit pas modifier le bouton du parent
const noop = () => {};
const exitingProps: StepProps = { setBtnText: noop, setIsDisabled: noop };

export default function Onboarding() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { updateUser } = useAuth();
  const { data, reset } = useOnboarding();
  const { width } = useWindowDimensions();

  const [section, setSection] = useState(0);
  const [ready, setReady] = useState(false);
  const [btnText, setBtnText] = useState('Suivant');
  const [isDisabled, setIsDisabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const finished = useRef(false); // true une fois l'onboarding envoyé : on ne sauvegarde plus rien

  // --- Reprise de l'étape sauvegardée ---
  useEffect(() => {
    AsyncStorage.getItem(SECTION_KEY)
      .then(v => {
        const n = parseInt(v ?? '', 10);
        if (n >= 0 && n <= 3) setSection(n);
      })
      .finally(() => setReady(true));
  }, []);

  // --- Sauvegarde de l'étape + drapeau "onboarding en cours" ---
  useEffect(() => {
    if (!ready || finished.current) return;
    AsyncStorage.setItem(SECTION_KEY, String(section));
    AsyncStorage.setItem(ACTIVE_KEY, '1');
  }, [section, ready]);

  // --- Carrousel ---
  const [prev, setPrev] = useState<number | null>(null); // étape qui est en train de sortir
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = suivant, -1 = retour
  const slide = useRef(new Animated.Value(0)).current;  // progression 0 -> 1
  const animating = useRef(false);

  const goTo = (next: number) => {
    if (animating.current || next === section) return;
    animating.current = true;

    setDirection(next > section ? 1 : -1);
    setPrev(section);
    setSection(next);
    slide.setValue(0);

    Animated.timing(slide, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setPrev(null);
      animating.current = false;
    });
  };

  // Suivant : l'ancienne étape sort à gauche, la nouvelle arrive par la droite.
  // Retour : l'ancienne sort à droite, la précédente arrive par la gauche.
  const outX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, -direction * width] });
  const inX = slide.interpolate({ inputRange: [0, 1], outputRange: [direction * width, 0] });

  const handlePrev = async () => {
    if (section === 0) {
      await AsyncStorage.removeItem(ACTIVE_KEY); // sinon welcome nous renverrait ici
      if (router.canGoBack()) router.back();
      else router.replace('/welcome');
      return;
    }
    goTo(section - 1);
  };

  const handleNext = async () => {
    if (isDisabled || submitting) return;
    if (section === 3) return submit();
    goTo(section + 1);
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
      finished.current = true;
      await AsyncStorage.multiRemove([SECTION_KEY, ACTIVE_KEY]);
      reset();
      updateUser({ has_seen_wodmatch_welcome: result.has_seen_wodmatch_welcome });
      router.replace('/profil' as any);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const step: StepProps = { setBtnText, setIsDisabled };

  const renderStep = (i: number, props: StepProps) => (
    <>
      {i === 0 && <HandlePhotos {...props} />}
      {i === 1 && <OnboardSkills {...props} />}
      {i === 2 && <OnboardAboutMe {...props} />}
      {i === 3 && <OnboardLevel {...props} />}
    </>
  );

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={handlePrev} hitSlop={10}>
            <Ionicons name="arrow-back-circle-outline" size={34} color="#222" />
          </Pressable>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${((section + 1) / 4) * 100}%` }]} />
          </View>
        </View>

        {/* Zone du carrousel */}
        <View style={styles.carousel}>
          {/* Étape qui sort (visible seulement pendant l'animation) */}
          {prev !== null && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { transform: [{ translateX: outX }] }]}
            >
              <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
                {renderStep(prev, exitingProps)}
              </ScrollView>
            </Animated.View>
          )}

          {/* Étape courante (arrive pendant l'animation) */}
          <Animated.View
            style={{ flex: 1, transform: [{ translateX: prev !== null ? inX : 0 }] }}
          >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              {renderStep(section, step)}
            </ScrollView>
          </Animated.View>
        </View>

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
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 24 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#d4d2d2', overflow: 'hidden' },
  bar: { height: 6, backgroundColor: '#df0000' },
  carousel: { flex: 1, overflow: 'hidden' },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  footer: { padding: 24, paddingTop: 8 },
  btn: { backgroundColor: '#222', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 17 },
});