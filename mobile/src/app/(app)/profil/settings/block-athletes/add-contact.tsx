import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWodmatchApi } from '@/lib/api';
import Avatar from '@/components/Avatar';
import { gray } from '@/constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

type Athlete = {
  id_user: number; label: string; avatar: string; club?: string; first_name: string; last_name: string;
};

// équivalent de optionsUsersFonction
const toOption = (user: any): Athlete => {
  const label = `${user.last_name.toUpperCase()} ${user.first_name}`;
  return {
    id_user: user.id,
    label,
    avatar: user.avatar ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${label.replace(/ /g, '')}`,
    club: user.club_name,
    first_name: user.first_name,
    last_name: user.last_name,
  };
};

// équivalent de customFilter
const matches = (a: Athlete, input: string) => {
  const q = normalize(input);
  return (
    normalize(`${a.last_name} ${a.first_name}`).includes(q) ||
    normalize(`${a.first_name} ${a.last_name}`).includes(q)
  );
};

export default function AddBlockAthlete() {
  const router = useRouter();
  const api = useWodmatchApi();

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    api('/users/get-visibles-athlete-lists')
      .then(list => setAthletes(Array.isArray(list) ? list.map(toOption) : []))
      .catch(e => Alert.alert('Erreur', e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(
    () => (search.trim() ? athletes.filter(a => matches(a, search)).slice(0, 20) : []),
    [athletes, search],
  );

  // Activé si un athlète est sélectionné OU si les deux champs manuels sont remplis
  const isFormValid = !!athlete || (!!fullname.trim() && !!email.trim());

  const submit = async () => {
    if (!isFormValid || saving) return;
    if (!athlete && !EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Adresse e-mail invalide');
      return;
    }
    setSaving(true);
    try {
      await api('/users/add-blocked-user', {
        method: 'POST',
        body: JSON.stringify({
          blocked_email: athlete ? undefined : email.trim(),
          contact_fullname: athlete ? undefined : fullname.trim(),
          id_user_blocked: athlete?.id_user ?? null,
        }),
      });
      router.back(); // la liste se recharge au retour
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: gray.g01 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back-circle-outline" size={34} color="#222" />
          </Pressable>
          <Pressable onPress={submit} disabled={!isFormValid || saving} hitSlop={10}>
            {saving ? (
              <ActivityIndicator color="#df0000" />
            ) : (
              <Text style={[styles.done, !isFormValid && { opacity: 0.4, color: gray.g09 }]}>Terminé</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.title}>Ajouter un Athlète</Text>

        {/* Athlète de la liste */}
        {athlete ? (
          <View style={styles.selected}>
            <Avatar uri={athlete.avatar} name={athlete.label} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{athlete.label}</Text>
              {!!athlete.club && <Text style={styles.club}>{athlete.club}</Text>}
            </View>
            <Pressable onPress={() => setAthlete(null)} hitSlop={10}>
              <Ionicons name="close" size={22} color="#222" />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#949696" />
              <TextInput
                style={styles.searchInput}
                placeholder="Taper le nom d'un athlète"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
              {loading && <ActivityIndicator color={gray.g085} />}
              {!loading && search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={10}>
                  <Ionicons name="close" size={20} color="#949696" />
                </Pressable>
              )}
            </View>

            {search.trim().length > 0 && (
              <View style={styles.results}>
                {results.length === 0 ? (
                  <Text style={styles.empty}>Aucun athlète trouvé</Text>
                ) : (
                  results.map(a => (
                    <Pressable
                      key={a.id_user}
                      style={styles.option}
                      onPress={() => {
                        setAthlete(a);
                        setSearch('');
                      }}
                    >
                      <Avatar uri={a.avatar} name={a.label} size={40} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{a.label}</Text>
                        {!!a.club && <Text style={styles.club}>{a.club}</Text>}
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {/* Saisie manuelle */}
            <View style={styles.or}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OU</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.fieldLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="ex: Mathew FRASER"
              autoCapitalize="words"
            />

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Email de l'athlète</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  done: { fontSize: 16, fontWeight: '700', color: '#df0000' },
  title: { fontSize: 24, fontWeight: '600', color: '#222', marginTop: 8, marginBottom: 24 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: gray.g06,
    borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  results: {
    marginTop: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: gray.g06, borderRadius: 8, overflow: 'hidden',
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: gray.g05,
  },
  empty: { padding: 16, textAlign: 'center', color: gray.g08 },
  selected: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#000', borderRadius: 10,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#222' },
  club: { fontSize: 13, color: gray.g08, marginTop: 1 },

  or: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 28 },
  orLine: { flex: 1, height: 1, backgroundColor: gray.g04 },
  orText: { fontSize: 14, fontWeight: '700', color: '#222', opacity: 0.7 },
  fieldLabel: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: gray.g06, borderRadius: 8, backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: '#222',
  },
});