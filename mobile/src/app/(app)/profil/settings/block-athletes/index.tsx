import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useWodmatchApi } from '@/lib/api';
import ConfirmSheet from '@/components/ConfirmSheet';
import { gray } from '@/constants/theme';

type Contact = {
  id_blocked_user_contact: number;
  contact_fullname: string | null;
  blocked_email: string;
  id_user_blocked: number | null;
  club_name?: string | null;
  updated_at: string;
};

const displayName = (c: Contact) => c.contact_fullname || c.blocked_email;

export default function BlockAthletes() {
  const router = useRouter();
  const api = useWodmatchApi();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Contact | null>(null);

  // Recharge au retour de la page "Ajouter un contact"
  useFocusEffect(
    useCallback(() => {
      let active = true;
      api('/users/get-blocked-athlets')
        .then(r => active && setContacts(Array.isArray(r) ? r : []))
        .catch(e => active && Alert.alert('Erreur', e.message))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Groupé par première lettre du nom
  const sections = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    contacts.forEach(c => {
      const first = displayName(c).normalize('NFD').charAt(0).toUpperCase(); // É -> E
      const letter = /[A-Z]/.test(first) ? first : '#';
      (groups[letter] ||= []).push(c);
    });
    return Object.keys(groups)
      .sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b))) // '#' en dernier
      .map(title => ({
        title,
        data: groups[title].sort((a, b) => displayName(a).localeCompare(displayName(b), 'fr')),
      }));
  }, [contacts]);

  const unblock = async () => {
    const c = pending;
    setPending(null);
    if (!c) return;
    try {
      await api(`/users/delete-blocked-user/${c.id_blocked_user_contact}`, { method: 'DELETE' });
      setContacts(list => list.filter(x => x.id_blocked_user_contact !== c.id_blocked_user_contact));
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={c => String(c.id_blocked_user_contact)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="arrow-back-circle-outline" size={34} color="#222" />
            </Pressable>
            <Text style={styles.title}>Bloquer des Athlètes</Text>
            <Text style={styles.text}>
              On ne choisit pas ses partenaires de box, mais sur WodMatch si. Ajoute les emails des profils que tu veux
              éviter — promis, ils ne sauront jamais.
            </Text>
            <Pressable
              style={styles.addBtn}
              onPress={() => router.push('/profil/settings/block-athletes/add-contact' as any)}
            >
              <Text style={styles.addBtnText}>Ajouter un contact</Text>
            </Pressable>
            {loading && <ActivityIndicator color={gray.g085} style={{ marginTop: 32 }} />}
          </View>
        }
        ListEmptyComponent={
          loading ? null : <Text style={styles.empty}>Aucun athlète bloqué pour le moment</Text>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.letter}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{displayName(item)}</Text>
              <Text style={styles.sub}>{item.club_name || item.blocked_email}</Text>
              <Text style={styles.date}>
                Ajouté le {new Date(item.updated_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <Pressable style={styles.unblock} onPress={() => setPending(item)}>
              <Text style={styles.unblockText}>Débloquer</Text>
            </Pressable>
          </View>
        )}
      />

      <ConfirmSheet
        visible={!!pending}
        confirmLabel="Débloquer"
        cancelLabel="Annuler"
        onCancel={() => setPending(null)}
        onConfirm={unblock}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: gray.g01 },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '600', color: '#222', marginTop: 8, marginBottom: 8 },
  text: { fontSize: 15, color: '#222', lineHeight: 22 },
  addBtn: { backgroundColor: '#000', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  empty: { textAlign: 'center', color: gray.g08, marginTop: 40, fontSize: 15 },
  letter: {
    fontSize: 18, fontWeight: '700', color: '#222', marginTop: 32, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: gray.g05,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: gray.g05,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  sub: { fontSize: 14, color: '#222', opacity: 0.6 },
  date: { fontSize: 13, color: '#222', opacity: 0.9, fontWeight: '500', marginTop: 6 },
  unblock: { borderWidth: 1, borderColor: '#222', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  unblockText: { fontSize: 13, fontWeight: '600', color: '#222' },
});