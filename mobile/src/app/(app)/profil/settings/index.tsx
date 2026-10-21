import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useAuth } from '@/context/AuthContext';
import { useWodmatchApi } from '@/lib/api';
import EditableLine from '@/components/EditableLine';
import ConfirmSheet from '@/components/ConfirmSheet';
import { gray } from '@/constants/theme';
import { useConfirmSheet } from '@/hooks/useConfirmSheet';
import HideOrDeleteModal from '@/components/HideOrDeleteModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0033|33|0)?[67]\d{8}$/;

const open = (url: string) => WebBrowser.openBrowserAsync(url);

// deux lignes qui se suivent partagent le même filet (comme mt-[-1px] sur le web)
const JOIN = { marginTop: -1 };

export default function Settings() {
  const router = useRouter();
  const api = useWodmatchApi();
  const { user, updateUser, signOut } = useAuth();
  const u: any = user;

  const [activeSection, setActiveSection] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [hideDeleteOpen, setHideDeleteOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle = (section: string) => setActiveSection(prev => (prev === section ? '' : section));
  const { confirm, sheet } = useConfirmSheet();

  const handleSaveEmail = async (val: string) => {
    const email = val.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      Alert.alert('Adresse e-mail invalide');
      throw new Error('invalid');
    }
    if (email === u?.email) return; // rien à enregistrer
    const ok = await confirm({
      message:
        'Cette modification mettra à jour votre email sur WodMatch™ et WodZone®.\n\n' +
        'Votre nouvelle adresse email servira désormais à vous connecter aux deux applications.',
    });
    if (!ok) throw new Error('cancelled');
    try {
      await api('/users/update-user-email', { method: 'PUT', body: JSON.stringify({ email }) });
      updateUser({ email } as any);
    } catch (e: any) {
      Alert.alert(e.status === 409 ? 'Cet e-mail est déjà utilisé' : 'Une erreur est survenue');
      throw e;
    }
  };

  const handleSaveTelephone = async (val: string) => {
    const telephone = val.trim();
    const digits = telephone.replace(/[\s\-().+]/g, '');
    if (!PHONE_REGEX.test(digits)) {
      Alert.alert('Numéro de téléphone invalide');
      throw new Error('invalid');
    }
    if (telephone === u?.telephone) return;
    try {
      await api('/users/update-user-telephone', { method: 'PUT', body: JSON.stringify({ telephone }) });
      updateUser({ telephone } as any);
    } catch (e: any) {
      Alert.alert(e.status === 409 ? 'Ce numéro de téléphone est déjà utilisé' : 'Une erreur est survenue');
      throw e;
    }
  };

  const hideProfile = async () => {
    try {
      await api('/users/handle-hide-user-profil', { method: 'PUT', body: JSON.stringify({ is_hidden: true }) });
      updateUser({ is_hidden: true } as any);
      router.replace('/' as any);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      // adapte la route à ton API : elle doit planifier la suppression (délai de 14 jours)
      // et envoyer l'email d'annulation
      await api('/users/delete-account', { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      signOut();
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de supprimer le compte pour le moment.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    // profil déjà masqué : on saute le choix "masquer / supprimer"
    if (u?.is_hidden) setDeleteConfirmOpen(true);
    else setHideDeleteOpen(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: gray.g01 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.done}>Terminé</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.padded}>
          <Text style={styles.section}>Gestion du compte</Text>
          <Text style={styles.text}>
            Pour plus de simplicité, votre compte <Text style={styles.bold}>WodMatch™</Text> et{' '}
            <Text style={styles.bold}>WodZone®</Text> sont synchronisés comme un WOD team.
          </Text>
        </View>

        <EditableLine
          style={{ marginTop: 24 }}
          label="Adresse e-mail" value={u?.email} keyboardType="email-address"
          isActive={activeSection === 'email'} onToggle={() => toggle('email')} onSave={handleSaveEmail}
        />
        <EditableLine
          style={JOIN}
          label="Num de Téléphone" value={u?.telephone} keyboardType="phone-pad"
          isActive={activeSection === 'telephone'} onToggle={() => toggle('telephone')} onSave={handleSaveTelephone}
        />
        <Text style={styles.hint}>
          Un numéro de téléphone et une adresse e-mail vérifiés permettent de sécuriser votre compte.
        </Text>

        <EditableLine
          style={{ marginTop: 24 }}
          label="Bloquer des Athlètes" onPress={() => router.push('/profil/settings/block-athletes' as any)}
        />
        <Text style={styles.hint}>
          On ne choisit pas ses partenaires de box, mais sur WodMatch si. Ajoute les emails des profils que tu veux
          éviter — promis, ils ne sauront jamais.
        </Text>

        <EditableLine
          style={{ marginTop: 24 }}
          label="Gérer ma visibilité" onPress={() => router.push('/profil/settings/visibility' as any)}
        />
        <Text style={styles.hint}>
          Choisis qui peut te voir dans la liste des athletes — tout le monde, personne, ou uniquement les membres de
          tes box. Valable aussi pour WodZone®
        </Text>

        <EditableLine style={{ marginTop: 24 }} label="Centre d'aides" onPress={() => open('https://help.wodzone.fr')} />
        <EditableLine style={JOIN} label="Règle et Communauté" onPress={() => open('https://help.wodzone.fr')} />
        <EditableLine style={JOIN} label="Politique relative au cookies" onPress={() => open('https://www.app.wodzone.fr/cookie-policy')} />
        <EditableLine
          style={JOIN} label="Politique de confidentialité"
          onPress={() => open('https://help.wodzone.fr/topics/about/62')}
        />
        <EditableLine style={JOIN} label="Condition de service" onPress={() => open('https://help.wodzone.fr/topics/about/60')} />

        <Pressable
          style={({ pressed }) => [styles.actionRow, { marginTop: 44 }, pressed && { backgroundColor: gray.g005 }]}
          onPress={() => setLogoutOpen(true)}
        >
          <Text style={styles.actionText}>Se déconnecter</Text>
        </Pressable>

        <View style={styles.version}>
          <MaterialCommunityIcons
            name="kettlebell" size={64} color="#222"
            style={{ transform: [{ rotate: '-16deg' }], opacity: 0.85 }}
          />
          <Text style={styles.versionText}>Version V{Constants.expoConfig?.version}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.actionRow, pressed && { backgroundColor: gray.g005 }]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.actionText}>Supprimer mon compte WodMatch</Text>
        </Pressable>
      </ScrollView>

      <ConfirmSheet
        visible={logoutOpen}
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          signOut();
        }}
      />
      <HideOrDeleteModal
        visible={hideDeleteOpen}
        onClose={() => setHideDeleteOpen(false)}
        onHide={() => {
          setHideDeleteOpen(false);
          hideProfile();
        }}
        onDelete={() => {
          setHideDeleteOpen(false);
          setTimeout(() => setDeleteConfirmOpen(true), 350);
        }}
      />
      <ConfirmDeleteModal
        visible={deleteConfirmOpen}
        loading={deleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={deleteAccount}
      />
      {sheet}
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

  content: { paddingTop: 20, paddingBottom: 48 },
  padded: { paddingHorizontal: 24 },
  section: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 8 },
  text: { fontSize: 15, color: '#222', lineHeight: 22 },
  bold: { fontWeight: '700' },
  hint: { fontSize: 15, color: gray.g07, marginTop: 14, lineHeight: 22, paddingHorizontal: 24 },

  actionRow: {
    backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: gray.g04,
    paddingVertical: 16, alignItems: 'center',
  },
  actionText: { fontSize: 15, fontWeight: '500', color: '#222' },

  version: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  versionText: { fontSize: 14, color: '#222' },
});