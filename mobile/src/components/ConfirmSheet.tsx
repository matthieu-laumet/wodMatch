import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gray } from '@/constants/theme';
import { BlurView } from 'expo-blur';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmSheet({
  visible, onConfirm, onCancel, confirmLabel = 'Supprimer', cancelLabel = 'Annuler',
}: Props) {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [visible]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <BlurView
          intensity={10}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 32, transform: [{ translateY }] }]}
        >
          <Pressable style={styles.btn} onPress={onConfirm}>
            <Text style={[styles.text, styles.confirm]}>{confirmLabel}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={onCancel}>
            <Text style={[styles.text, styles.cancel]}>{cancelLabel}</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { paddingHorizontal: 12, gap: 12 },
  btn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 22, alignItems: 'center' },
  text: { fontSize: 17, fontWeight: '600', letterSpacing: 1 },
  confirm: { color: '#e53935' },
  cancel: { color: gray.g08 },
});