import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onRewind?: () => void; onPass?: () => void; onLike?: () => void; onSend?: () => void;
  variant?: 'full' | 'compact';
};

// Halo : cercles blancs empilés, du plus large (très transparent) au plus proche (plus opaque)
const HALO_SPREAD = [40, 32, 25, 19, 14, 9, 5]; // débordement en px autour du bouton
const HALO_OPACITY = 0.3;                        // augmente pour un halo plus fort

function Halo({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <View style={{ width: size, height: size }} pointerEvents="box-none">
      {HALO_SPREAD.map(extra => (
        <View
          key={extra}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -extra, left: -extra,
            width: size + extra * 2, height: size + extra * 2,
            borderRadius: 999,
            backgroundColor: `rgba(255,255,255,${HALO_OPACITY})`,
          }}
        />
      ))}
      {children}
    </View>
  );
}

export default function SwipeElement({ onRewind, onPass, onLike, onSend, variant = 'full' }: Props) {
  if (variant === 'compact') {
    return (
      <View style={s.compact} pointerEvents="box-none">
        <Pressable style={[s.btn, s.big, { borderColor: '#f87171' }]} onPress={onPass}>
          <Ionicons name="close" size={30} color="#f87171" />
        </Pressable>
        <Pressable style={[s.btn, s.small, { borderColor: '#303030' }]} onPress={onSend}>
          <Ionicons name="paper-plane-outline" size={22} color="#303030" />
        </Pressable>
        <Pressable style={[s.btn, s.big, { borderColor: '#87BA7E' }]} onPress={onLike}>
          <Ionicons name="heart" size={28} color="#87BA7E" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container} pointerEvents="box-none">
      <Pressable style={[s.btn, s.small, { borderColor: '#303030' }]} onPress={onRewind}>
        <Ionicons name="arrow-undo-outline" size={22} color="#303030" />
      </Pressable>
      <Pressable style={[s.btn, s.big, { borderColor: '#f87171' }]} onPress={onPass}>
        <Ionicons name="close" size={30} color="#f87171" />
      </Pressable>
      <Pressable style={[s.btn, s.big, { borderColor: '#87BA7E' }]} onPress={onLike}>
        <Ionicons name="heart" size={28} color="#87BA7E" />
      </Pressable>
      <Pressable style={[s.btn, s.small, { borderColor: '#303030' }]} onPress={onSend}>
        <Ionicons name="paper-plane-outline" size={22} color="#303030" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderWidth: 2, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android
  },
  flat: { shadowOpacity: 0, elevation: 0 }, // pas d'ombre grise : le halo la remplace
  compact: {
    height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 38,
    transform: [{ scale: 1.15 }],
  },
  container: { height: 56, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  small: { width: 48, height: 48 },
  big: { width: 56, height: 56 },
});