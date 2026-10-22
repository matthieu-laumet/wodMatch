import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = { value: string; onChangeText: (t: string) => void; isLoading?: boolean; onPressFilters?: () => void };

export default function SearchCompet({ value, onChangeText, isLoading, onPressFilters }: Props) {
  return (
    <View style={s.row}>
      <View style={s.inputWrap}>
        <Ionicons name="search" size={16} style={s.iconLeft} />
        <TextInput
          style={s.input}
          placeholder="Rechercher une compet"
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {isLoading && <ActivityIndicator size="small" style={s.loader} />}
        {value.length > 0 && (
          <Pressable hitSlop={10} onPress={() => onChangeText('')} style={s.iconRight}>
            <Ionicons name="close" size={18} />
          </Pressable>
        )}
      </View>
      {/* TODO: ouvrir le bottom sheet de filtres (prix + départements) */}
      <Pressable hitSlop={8} onPress={onPressFilters}>
        <Ionicons name="options-outline" size={26} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 20 },
  inputWrap: { flex: 1, justifyContent: 'center' },
  input: { height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#808080', paddingLeft: 36, paddingRight: 56 },
  iconLeft: { position: 'absolute', left: 10 },
  iconRight: { position: 'absolute', right: 10 },
  loader: { position: 'absolute', right: 36 },
});