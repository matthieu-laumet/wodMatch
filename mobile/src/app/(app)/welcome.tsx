import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';

const TITLE_APP = 'wodMatch';
const GOLD = '#c9a227';
const DARK = '#222';

type SearchMode = { id_search_mode: number; label: string; icon: string };

// Les icônes du backend sont des SVG distants, que <Image> de React Native ne sait pas afficher.
// On utilise donc des icônes Ionicons selon le mode (1 = seul, sinon team).
const modeIcon = (id: number): keyof typeof Ionicons.glyphMap => (id === 1 ? 'person' : 'people');

export default function Welcome() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { data, set } = useOnboarding();
  const [modes, setModes] = useState<SearchMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/searchModes/gets-all-searchModes')
      .then(setModes)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={DARK} />;

  const canContinue = data.searchMode !== null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue sur {TITLE_APP}</Text>

        <View style={styles.row}>
          <Ionicons name="trophy" size={52} color={GOLD} />
          <Text style={styles.subtitle}>Swipe ton prochain{'\n'}coéquipier de podium™</Text>
        </View>

        <Text style={styles.body}>
          <Text style={styles.bold}>{TITLE_APP}</Text> rassemble les athlètes qui souhaitent compléter leur team
          pour la prochaine compet. Trouve alors ton prochain binôme, complète ta team, et monte sur le podium 💪
        </Text>

        <Text style={styles.choose}>Choisis ton mode</Text>
        <Text style={styles.hint}>Tu pourras changer à tout moment</Text>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {modes.map(mode => {
          const active = data.searchMode === mode.id_search_mode;
          return (
            <Pressable
              key={mode.id_search_mode}
              onPress={() => set({ searchMode: mode.id_search_mode })}
              style={[styles.mode, active && styles.modeActive]}
            >
              <View style={styles.modeIconBox}>
                <Ionicons name={modeIcon(mode.id_search_mode)} size={24} color="#000" />
              </View>
              <Text style={styles.modeLabel}>{mode.label}</Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[styles.btn, canContinue ? styles.btnOn : styles.btnOff]}
          disabled={!canContinue}
          onPress={() => router.push('/onboarding')}
        >
          <Text style={styles.btnText}>Suivant</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 32 },

  title: { fontSize: 34, fontWeight: '800', textAlign: 'center', color: DARK, lineHeight: 40 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 28 },
  subtitle: { flex: 1, fontSize: 19, fontWeight: '600', color: DARK, lineHeight: 26 },

  body: { marginTop: 24, fontSize: 16, color: DARK, lineHeight: 24 },
  bold: { fontWeight: '800', fontSize: 17 },

  choose: { marginTop: 32, fontSize: 19, fontWeight: '700', color: DARK },
  hint: { fontSize: 15, color: '#555', marginTop: 2, marginBottom: 16 },
  error: { color: '#c0392b', marginBottom: 12 },

  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9aa0a6',
    borderRadius: 10,
  },
  modeActive: { borderColor: '#000', borderWidth: 2, paddingVertical: 15, paddingHorizontal: 15 },
  modeIconBox: { width: 32, alignItems: 'center' },
  modeLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: DARK },

  btn: { marginTop: 8, borderRadius: 12, paddingVertical: 17, alignItems: 'center' },
  btnOn: { backgroundColor: '#000' },
  btnOff: { backgroundColor: '#9a9a9a' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});