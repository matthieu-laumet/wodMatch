import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gray } from '@/constants/theme';

type Props = {
  visible: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({ visible, loading = false, onConfirm, onCancel }: Props) {
  const close = () => { if (!loading) onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        {/* Pressable vide : un tap sur la carte ne ferme pas la modale */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable style={styles.close} onPress={close} hitSlop={12}>
            <Ionicons name="close" size={26} color={gray.g07} />
          </Pressable>

          <Text style={styles.title}>Confirmer la suppression</Text>

          <Text style={styles.message}>
            Cette action est <Text style={styles.bold}>irréversible</Text>. Tu perdras :{'\n'}
            Ton profil et tes photos{'\n'}
            Les informations que tu as saisies
          </Text>
          <Text style={[styles.message, { marginTop: 16 }]}>
            Tu recevras un email avec un lien pour annuler pendant 14 jours.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.primary, (pressed || loading) && { opacity: 0.85 }]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryText}>Oui, supprimer définitivement</Text>}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.secondaryText}>Annuler</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, paddingTop: 28 },
  close: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: '#444', textAlign: 'center', marginBottom: 16, marginHorizontal: 24 },
  message: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center' },
  bold: { fontWeight: '700' },
  primary: {
    marginTop: 24, backgroundColor: '#222', borderRadius: 6, paddingVertical: 18,
    alignItems: 'center', minHeight: 58, justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: {
    marginTop: 12, backgroundColor: '#eee', borderRadius: 6, borderWidth: 1, borderColor: '#ddd',
    paddingVertical: 18, alignItems: 'center',
  },
  secondaryText: { color: '#666', fontSize: 16, fontWeight: '700' },
});