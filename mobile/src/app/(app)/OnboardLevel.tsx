import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';

type Level = { id_level: number; label: string; icon: string };
type Props = { setBtnText: (t: string) => void; setIsDisabled: (b: boolean) => void };

export default function OnboardLevel({ setBtnText, setIsDisabled }: Props) {
  const api = useWodmatchApi();
  const { data, set } = useOnboarding();
  const selected: Level[] = data.levels ?? [];
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/levels/gets-all-levels').then(setLevels).catch(console.error).finally(() => setLoading(false));
    setBtnText('Terminer');
  }, []);

  useEffect(() => {
    setIsDisabled(selected.length === 0);
  }, [selected.length]);

  const toggle = (level: Level) => {
    const exists = selected.some(s => s.id_level === level.id_level);
    if (exists && selected.length === 1) return; // on garde au moins un niveau
    set({ levels: exists ? selected.filter(s => s.id_level !== level.id_level) : [...selected, level] });
  };

  return (
    <View>
      <Text style={styles.title}>Quel est ton niveau de Fitness ?</Text>
      <Text style={styles.text}>Promis c'est la dernière étape.{'\n'}Tu peux choisir plusieurs propositions</Text>

      {loading ? (
        <ActivityIndicator color="#222" style={{ marginTop: 24 }} />
      ) : (
        levels.map(level => {
          const on = selected.some(s => s.id_level === level.id_level);
          return (
            <Pressable key={level.id_level} onPress={() => toggle(level)} style={[styles.item, on && styles.itemOn]}>
              <Image source={{ uri: level.icon }} style={styles.icon} resizeMode="contain" />
              <Text style={styles.label}>{level.label}</Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '600', color: '#222', marginBottom: 8 },
  text: { fontSize: 16, color: '#222', marginBottom: 20 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12,
  },
  itemOn: { borderColor: '#222', backgroundColor: '#f3f3f3' },
  icon: { width: 32, height: 32 },
  label: { fontSize: 16, fontWeight: '600', color: '#222', flex: 1 },
});