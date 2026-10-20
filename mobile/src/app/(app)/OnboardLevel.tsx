import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWodmatchApi } from '../../lib/api';
import { useOnboarding } from '../../context/OnboardingContext';
import { SvgUri } from 'react-native-svg';

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
      
      <View style={{ marginTop: 32 }}>
        {loading ? (
          <ActivityIndicator color="#222" style={{ marginTop: 24 }} />
        ) : (
          levels.map(level => {
            const on = selected.some(s => s.id_level === level.id_level);
            return (
              <Pressable key={level.id_level} onPress={() => toggle(level)} style={[styles.item, on && styles.itemOn]}>
                <SvgUri uri={level.icon} width={32} height={32} />
                <Text style={styles.label}>{level.label}</Text>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 6 },
  text: { fontSize: 15, color: '#555', lineHeight: 21 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9aa0a6',
    borderRadius: 10,
  },
  itemOn: { borderColor: '#222', backgroundColor: '#dddcdc', boxShadow: '0 0 0 1px #222' },
  icon: { width: 28, height: 28 },
  label: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1, letterSpacing: 0.3 },
});