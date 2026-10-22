import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GetImage from './GetImage';
import { liaisonVille } from '../utils/textTransform';
import { useToggleFavorite } from '../hooks/queries';
import type { Competition } from '../types/competition';

const MONTHS = ['JAN', 'FÉV', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];

type Props = { competition: Competition; isFavorite: boolean; showFavorite?: boolean; isLast?: boolean };

function CompetitionCard({ competition, isFavorite, showFavorite = true, isLast = false }: Props) {
  const toggleFavorite = useToggleFavorite();

  const prices = competition.divisions?.map(d => d.price) ?? [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const price = minPrice === 0 ? 'Gratuit' : `${minPrice}${minPrice !== maxPrice ? `-${maxPrice}` : ''} €`;

  const date = new Date(competition.begin);
  const modes = [...(competition.event_mode ?? [])]
    .sort((a, b) => a.order - b.order)
    .map(m => `#${m.mode}`)
    .join(' ');

  const showDistance =
    !!competition.distance &&
    !!competition.queryMatchCity &&
    !competition.location?.includes(competition.queryMatchCity);

  return (
    <Pressable
      style={[s.card, isLast && s.cardLast]}
      onPress={() => router.push(`/competitions/${competition.id_competition}`)}
    >
      <View style={s.left}>
        <View style={s.dateRow}>
          <Text style={s.day}>{date.getDate()}</Text>
          <Text style={s.month}>{MONTHS[date.getMonth()]}</Text>
        </View>
        <GetImage src={competition.img_small} style={s.img} />
        <Text style={s.price}>{price}</Text>
      </View>

      <View style={s.separator} />

      <View style={s.right}>
        <View style={s.modesRow}>
          <Text style={s.modes} numberOfLines={1}>{modes}</Text>
          {showFavorite && (
            <Pressable hitSlop={12} onPress={() => toggleFavorite.mutate(competition.id_competition)}>
              <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={22} />
            </Pressable>
          )}
        </View>
        <Text style={s.name}>{competition.name}</Text>
        {showDistance && (
          <View style={s.distance}>
            <Ionicons name="navigate-outline" size={16} />
            <Text style={s.small}>
              {competition.distance} km {liaisonVille(competition.queryMatchCity)}
            </Text>
          </View>
        )}
        <View style={s.address}>
          <Ionicons name="location-sharp" size={14} />
          <Text style={s.small}>
            {competition.compet_adresse?.trim()},{showFavorite ? '\n' : ' '}
            {competition.compet_code_postal} {competition.compet_ville}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(CompetitionCard);

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#A9A9A9' },
  left: { alignItems: 'center', minWidth: 65 },
  cardLast: { borderBottomWidth: 0 },
  dateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 4 },
  day: { fontSize: 20, fontWeight: '900' },
  month: { fontSize: 13, fontWeight: '600' },
  img: { width: 65, height: 65, borderRadius: 8, borderWidth: 1, borderColor: '#696969', backgroundColor: '#fff' },
  price: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  separator: { width: 1, height: 80, backgroundColor: '#A9A9A9' },
  right: { flex: 1 },
  modesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modes: { flex: 1, fontSize: 13, fontWeight: '500', color: '#808080' },
  name: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  distance: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, opacity: 0.5 },
  address: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  small: { fontSize: 13, fontWeight: '500' },
});