import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureDetector, GestureHandlerRootView, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_ZOOM = 4;
const OUTPUT_WIDTH = 1080;

type Props = {
  uri: string;
  imgWidth: number;
  imgHeight: number;
  onConfirm: (uri: string) => void;
  onCancel: () => void;
  progress?: string; // ex: "2/4"
};

export default function CropModal({ uri, imgWidth, imgHeight, progress, onConfirm, onCancel }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [busy, setBusy] = useState(false);

  // cadre de recadrage 3:4
  const frameW = screenW - 48;
  const frameH = Math.round(frameW * (4 / 3));

  // échelle de base : l'image couvre exactement le cadre
  const baseScale = Math.max(frameW / imgWidth, frameH / imgHeight);
  const baseW = imgWidth * baseScale;
  const baseH = imgHeight * baseScale;

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const clamp = (v: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(v, min), max);
  };

  // empêche de sortir l'image du cadre (pas de bords vides)
  const clampPosition = () => {
    'worklet';
    const maxX = Math.max(0, (baseW * scale.value - frameW) / 2);
    const maxY = Math.max(0, (baseH * scale.value - frameH) / 2);
    tx.value = clamp(tx.value, -maxX, maxX);
    ty.value = clamp(ty.value, -maxY, maxY);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate(e => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
      clampPosition();
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate(e => {
      scale.value = clamp(savedScale.value * e.scale, 1, MAX_ZOOM);
      clampPosition();
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const confirm = async () => {
    setBusy(true);
    try {
      // pixels d'écran par pixel de l'image source
      const k = baseScale * scale.value;
      const visW = frameW / k;
      const visH = frameH / k;

      const originX = Math.max(0, Math.round(imgWidth / 2 - tx.value / k - visW / 2));
      const originY = Math.max(0, Math.round(imgHeight / 2 - ty.value / k - visH / 2));
      const width = Math.min(Math.round(visW), imgWidth - originX);
      const height = Math.min(Math.round(visH), imgHeight - originY);

      const out = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX, originY, width, height } }, { resize: { width: OUTPUT_WIDTH } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      onConfirm(out.uri);
    } catch (e) {
      console.error('crop', e);
      setBusy(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <GestureHandlerRootView style={styles.root}>
        <Text style={styles.title}>Recadre ta photo{progress ? ` (${progress})` : ''}</Text>
        <Text style={styles.hint}>Glisse pour déplacer, pince pour zoomer</Text>

        <GestureDetector gesture={gesture}>
          <View style={[styles.frame, { width: frameW, height: frameH }]}>
            <Animated.Image
              source={{ uri }}
              resizeMode="cover"
              style={[
                {
                  position: 'absolute',
                  width: baseW,
                  height: baseH,
                  left: (frameW - baseW) / 2,
                  top: (frameH - baseH) / 2,
                },
                imageStyle,
              ]}
            />
          </View>
        </GestureDetector>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnGhost]} onPress={onCancel} disabled={busy}>
            <Text style={styles.btnGhostText}>Annuler</Text>
          </Pressable>
          <Pressable style={[styles.btn, busy && { opacity: 0.5 }]} onPress={confirm} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Valider</Text>}
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  hint: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  frame: { overflow: 'hidden', borderRadius: 12, borderWidth: 2, borderColor: '#fff', backgroundColor: '#111' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, paddingHorizontal: 24 },
  btn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#666' },
  btnGhostText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});