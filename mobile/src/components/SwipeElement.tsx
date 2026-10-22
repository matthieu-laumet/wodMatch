import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = { onRewind?: () => void; onPass?: () => void; onLike?: () => void; onSend?: () => void };

export default function SwipeElement({ onRewind, onPass, onLike, onSend }: Props) {
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
  container: { height: 56, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  btn: { borderWidth: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  small: { width: 48, height: 48 },
  big: { width: 56, height: 56 },
});