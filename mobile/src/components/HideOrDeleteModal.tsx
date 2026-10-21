import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gray } from '@/constants/theme';
import { BlurView } from 'expo-blur';

type Props = {
  visible: boolean;
  onClose: () => void;
  onHide: () => void;
  onDelete: () => void;
};

export default function HideOrDeleteModal({ visible, onClose, onHide, onDelete }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView
          intensity={10}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        {/* Pressable vide : un tap sur la carte ne ferme pas la modale */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={26} color={gray.g07} />
          </Pressable>

          <Text style={styles.title}>Masquer mon compte</Text>
          <Text style={styles.message}>
            Besoin de break ? Tu peux masquer ton profil et disparaître des recherches. Ton compte reste intact, tu
            reviens quand tu veux.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
            onPress={onHide}
          >
            <Text style={styles.primaryText}>Masquer mon compte</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
            onPress={onDelete}
          >
            <Text style={styles.secondaryText}>Supprimer mon compte</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24,
  },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, paddingTop: 28 },
  close: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  title: { fontSize: 22, fontWeight: '700', color: '#444', textAlign: 'center', marginBottom: 16, marginHorizontal: 24 },
  message: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center', marginBottom: 24 },
  primary: { backgroundColor: '#222', borderRadius: 6, paddingVertical: 18, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: {
    marginTop: 12, backgroundColor: '#eee', borderRadius: 6, borderWidth: 1, borderColor: '#ddd',
    paddingVertical: 18, alignItems: 'center',
  },
  secondaryText: { color: '#666', fontSize: 16, fontWeight: '700' },
});