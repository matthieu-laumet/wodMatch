import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardTypeOptions, Pressable, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gray } from '@/constants/theme';

type Props = {
  label: string;
  value?: string | null;
  onSave?: (value: string) => Promise<void>; // doit throw pour rester ouvert
  isActive?: boolean;
  onToggle?: () => void;
  onPress?: () => void; // ligne-lien (navigation) : pas de saisie
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

export default function EditableLine({
  label, value, onSave, isActive = false, onToggle, onPress, keyboardType, placeholder, style,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [input, setInput] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    setInput(value ?? '');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const save = async () => {
    if (saving || !onSave) return;
    setSaving(true);
    try {
      await onSave(input);
      onToggle?.(); // ferme seulement si onSave s'est bien passé
    } catch {
      // reste ouvert
    } finally {
      setSaving(false);
    }
  };

  const isLink = !!onPress;

  return (
    <View style={[styles.box, style]}>
      <Pressable
        style={({ pressed }) => [styles.line, pressed && { backgroundColor: gray.g005 }]}
        onPress={isLink ? onPress : onToggle}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.right}>
          {!isActive && !!value && <Text style={styles.value} numberOfLines={1}>{value}</Text>}
          <Ionicons name={isActive ? 'chevron-down' : 'chevron-forward'} size={16} color={gray.g07} />
        </View>
      </Pressable>

      {isActive && !isLink && (
        <View style={styles.section}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            keyboardType={keyboardType}
            placeholder={placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <Pressable style={[styles.btn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Enregistrer</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ligne pleine largeur avec filets haut et bas (comme sur le web)
  box: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: gray.g04,
  },
  line: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 24, gap: 12,
  },
  label: { fontSize: 15, fontWeight: '700', color: '#222' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, maxWidth: '62%' },
  value: { fontSize: 13, color: '#222', flexShrink: 1 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingBottom: 14 },
  input: {
    flex: 1, borderWidth: 1, borderColor: gray.g05, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#222', backgroundColor: '#fff',
  },
  btn: { backgroundColor: '#000', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, minWidth: 104, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});