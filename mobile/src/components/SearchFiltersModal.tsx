import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RED = '#df0000';

function AppSlider({ values, min, max, onChange, color, length }: {
  values: number[]; min: number; max: number; onChange: (v: number[]) => void; color: string; length: number;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      <MultiSlider
        values={values}
        min={min}
        max={max}
        step={1}
        sliderLength={length}
        onValuesChange={onChange}
        selectedStyle={{ backgroundColor: color }}
        unselectedStyle={{ backgroundColor: '#ccc' }}
        markerStyle={s.marker}
        trackStyle={{ height: 2 }}
      />
    </View>
  );
}

// ---- PLACEHOLDERS : à remplacer par l'API ----
const MODES = [
  { id: 1, label: 'Je suis seul', icon: 'person' as const },
  { id: 2, label: 'Team incomplète', icon: 'people' as const },
];
const MY_COMPETITIONS = [
  { id: 102, name: 'Toulouse Throwdown', dates: '17-18 JAN 2026', isFavorite: true },
  { id: 103, name: 'Agen Showdown', dates: '25-26 OCT 2025', isFavorite: false },
  { id: 104, name: 'Bordeaux Games', dates: '07-08 MARS 2026', isFavorite: false },
  { id: 105, name: 'Lyon Open', dates: '14-15 MARS 2026', isFavorite: false },
];
const CATEGORIES = ['Scaled', 'Inter', 'RX', 'Elite'];
// -----------------------------------------------

export type SearchFilters = {
  modeId: number;
  competitionId: number;
  categories: Record<number, string[]>; // par compétition
  ageRange: [number, number];
  showOutOfRange: boolean;
  minAthletes: number;
  withBio: boolean;
};

const DEFAULT_FILTERS: SearchFilters = {
  modeId: 1,
  competitionId: MY_COMPETITIONS[0].id,
  categories: {},
  ageRange: [22, 36],
  showOutOfRange: true,
  minAthletes: 1,
  withBio: true,
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: SearchFilters) => void;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={s.sectionTitle}>
      <Text style={s.sectionTitleText}>{children}</Text>
    </View>
  );
}

function Chip({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon?: any }) {
  return (
    <Pressable style={[s.chip, active && s.chipActive]} onPress={onPress}>
      {icon && <Ionicons name={icon} size={14} color="#222" style={{ marginRight: 6 }} />}
      <Text style={s.chipText}>{label}</Text>
    </Pressable>
  );
}

export default function SearchFiltersModal({ visible, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [f, setF] = useState<SearchFilters>(DEFAULT_FILTERS);

  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setF(prev => ({ ...prev, [key]: value }));

  const selectedCompetition = MY_COMPETITIONS.find(c => c.id === f.competitionId)!;
  const selectedCategories = f.categories[f.competitionId] ?? [];

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    set('categories', { ...f.categories, [f.competitionId]: next });
  };

  const handleOk = () => {
    onApply?.(f);
    onClose();
  };

  // 7% de marge de chaque côté
  const sliderLength = width * 0.86;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.title}>Réglage de recherche</Text>
          <Pressable style={s.ok} onPress={handleOk} hitSlop={8}>
            <Text style={s.okText}>OK</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {/* MODES */}
          <SectionTitle>MODES</SectionTitle>
          <View style={[s.block, s.row]}>
            {MODES.map(m => (
              <Chip
                key={m.id}
                label={m.label}
                icon={m.icon}
                active={f.modeId === m.id}
                onPress={() => set('modeId', m.id)}
              />
            ))}
          </View>

          {/* COMPETITIONS */}
          <SectionTitle>MES COMPETITIONS</SectionTitle>
          <View style={s.block}>
            <View style={[s.row, { alignItems: 'center' }]}>
              <Ionicons name="star" size={20} color="#222" />
              {MY_COMPETITIONS.map(c => (
                <Pressable
                  key={c.id}
                  style={[s.logo, f.competitionId === c.id && s.logoActive]}
                  onPress={() => set('competitionId', c.id)}
                >
                  {/* TODO: remplacer par le logo de la compétition */}
                  <Text style={s.logoText}>{c.name[0]}</Text>
                </Pressable>
              ))}
            </View>

            <View style={s.compHeader}>
              <Text style={s.compName}>{selectedCompetition.name}</Text>
              <Text style={s.compDates}>{selectedCompetition.dates}</Text>
            </View>

            <Text style={s.label}>Intéressé par les catégories :</Text>
            <View style={s.row}>
              {CATEGORIES.map(cat => (
                <Chip key={cat} label={cat} active={selectedCategories.includes(cat)} onPress={() => toggleCategory(cat)} />
              ))}
            </View>

            <View style={s.separator} />

            <View style={s.spaceBetween}>
              <Text style={s.label}>Tranche d'âge moyen de la team</Text>
              <Text style={s.label}>{f.ageRange[0]}-{f.ageRange[1]}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AppSlider 
                values={f.ageRange} min={16} max={60} length={sliderLength - 24} color={RED}
                onChange={v => set('ageRange', [v[0], v[1]])} 
              />
            </View>

            <View style={s.spaceBetween}>
              <Text style={[s.hint, { flex: 1, paddingRight: 16 }]}>
                Montrer des personnes légèrement en dehors de cette tranche d'âge si je n'ai plus de profil à voir
              </Text>
              <Switch
                value={f.showOutOfRange}
                onValueChange={v => set('showOutOfRange', v)}
                trackColor={{ true: RED }}
              />
            </View>
          </View>

          {/* PLUS DE CRITERES */}
          <SectionTitle>PLUS DE CRITERES</SectionTitle>
          <View style={s.block}>
            <View style={s.spaceBetween}>
              <Text style={s.label}>Nombre d'athlètes minimun déjà présent</Text>
              <Text style={s.label}>{f.minAthletes} / 4</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
            <AppSlider 
              values={[f.minAthletes]} min={0} max={4} length={sliderLength - 24} color={RED}
              onChange={v => set('minAthletes', v[0])} 
            />
            </View>
            <View style={[s.separator, { marginTop: 8 }]} />
            <View style={s.spaceBetween}>
              <Text style={s.label}>Avec une bio</Text>
              <Switch value={f.withBio} onValueChange={v => set('withBio', v)} trackColor={{ true: RED }} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600' },
  ok: { position: 'absolute', right: '7%', top: 20 },
  okText: { color: '#2F54EB', fontWeight: '700', fontSize: 16 },

  sectionTitle: { backgroundColor: '#F5F5F5', paddingHorizontal: '7%', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ddd' },
  sectionTitleText: { fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  block: { paddingHorizontal: '7%', paddingVertical: 16 },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  separator: { height: 1, backgroundColor: '#ddd', marginVertical: 16 },

  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#808080', backgroundColor: '#fff' },
  chipActive: { borderWidth: 2, borderColor: '#130E0A', backgroundColor: '#F5F5F5' },
  chipText: { fontSize: 14 },

  logo: { width: 40, height: 40, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  logoActive: { borderWidth: 2, borderColor: '#130E0A' },
  logoText: { fontWeight: '700' },

  compHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  compName: { fontWeight: '700', fontSize: 15, textTransform: 'uppercase' },
  compDates: { fontSize: 12 },

  label: { fontSize: 14, marginVertical: 12 },
  hint: { fontSize: 12, color: '#B00020' },
  marker: { height: 24, width: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#222' },
});