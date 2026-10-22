import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useCompetition, useHandleUserSearchMode, useSearchModes } from '../../../hooks/queries';
import CompetitionCard from '../../../components/CompetitionCard';
import SwipeElement from '../../../components/SwipeElement';

const HERO_IMAGE =
  'https://res.cloudinary.com/dkz9knsgj/image/upload/v1782672401/77a1611d746ad20a1728e672eb9d681450587978_dd17zo.jpg';
const NO_MORE_IMAGE =
  'https://res.cloudinary.com/dkz9knsgj/image/upload/v1782660790/drilldown_ptcaiy.jpg';

const SWIPE_OVERLAP = 28; // moitié de la hauteur des boutons

function NoMoreProfiles() {
  return (
    <View style={s.noMore}>
      <Image source={{ uri: NO_MORE_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="bottom" />
      <LinearGradient
        colors={['#F5F5F5', 'rgba(245,245,245,0.1)']}
        locations={[0, 0.3]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={s.noMoreContent}>
        <Text style={s.noMoreTitle}>Oupss...</Text>
        <Text style={s.noMoreText}>
          Personne ne traîne à la box à cette heure-ci… Plus aucun coéquipier disponible pour cette compétition. Check
          les autres compétitions, ton équipe est peut-être ailleurs !
        </Text>
        <Pressable style={s.blackBtn} onPress={() => router.navigate('/')}>
          <Text style={s.blackBtnText}>Voir les autres compétitions</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ExploreWorld() {
  const { id_competition } = useLocalSearchParams<{ id_competition: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: competition, isLoading } = useCompetition(Number(id_competition));
  const { data: searchModes } = useSearchModes();
  const changeMode = useHandleUserSearchMode();

  const noMoreProfils = false; // TODO: viendra de l'API des profils

  if (isLoading) {
    return <View style={s.center}><ActivityIndicator /></View>;
  }
  if (!competition) {
    return (
      <View style={s.center}>
        <Text>Compétition introuvable.</Text>
        <Pressable style={[s.blackBtn, { marginTop: 16 }]} onPress={() => router.navigate('/')}>
          <Text style={s.blackBtnText}>Retour aux compétitions</Text>
        </Pressable>
      </View>
    );
  }
  if (noMoreProfils) return <NoMoreProfiles />;

  return (
    <View style={s.root}>
      {/* Zone photo */}
      <View style={s.hero}>
        <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)',
          ]}
          locations={[0, 0.05, 0.2, 0.7, 0.9, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={[s.modeHeader, { paddingTop: 16 }]}>
          <View style={s.modes}>
            {searchModes?.map(mode => {
              const isActive = user?.id_search_mode === mode.id_search_mode;
              return (
                <Pressable
                  key={mode.id_search_mode}
                  style={[s.modeBtn, isActive && s.modeBtnActive]}
                  onPress={() => changeMode.mutate(mode.id_search_mode)}
                >
                  <Image source={{ uri: mode.icon }} style={s.modeIcon} contentFit="contain" />
                  {isActive && <Text style={s.modeLabel}>{mode.label_short}</Text>}
                </Pressable>
              );
            })}
          </View>
          {/* TODO: ouvrir les filtres de recherche */}
          <Pressable hitSlop={8}>
            <Ionicons name="options-outline" size={30} color="#fff" style={s.shadow} />
          </Pressable>
        </View>

        {/* TODO: remplacer par le profil affiché (placeholder identique au web) */}
        <View style={s.participant}>
          <View>
            <Text style={[s.pName, s.shadow]}>Les pas là pour être ici</Text>
            <Text style={[s.pText, s.shadow]}>Recherche 1 athlète (F)</Text>
            <Text style={[s.pText, s.shadow]}>Niveau Inter</Text>
          </View>
          <Pressable hitSlop={8}>
            <Ionicons name="share-outline" size={30} color="#fff" style={s.shadow} />
          </Pressable>
        </View>
      </View>

      {/* Boutons de swipe à cheval entre la photo et le footer */}
      <View style={s.footerWrap} pointerEvents="box-none">
        <View style={s.swipe} pointerEvents="box-none">
          <SwipeElement />
        </View>
        <View style={s.footer}>
          <CompetitionCard competition={competition} isFavorite={false} showFavorite={false} isLast />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { flex: 1 },
  modeHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '7%' },
  modes: { flexDirection: 'row', gap: 12 },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#808080', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12,
  },
  modeBtnActive: { borderWidth: 2, borderColor: '#130E0A' },
  modeIcon: { width: 20, height: 20 },
  modeLabel: { fontSize: 14 },
  participant: {
    position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: '7%',
    paddingBottom: SWIPE_OVERLAP + 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  pName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  pText: { fontSize: 14, fontWeight: '500', color: '#fff' },
  shadow: { textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },

  footerWrap: { marginTop: -SWIPE_OVERLAP },
  swipe: { zIndex: 2 },
  footer: {
    marginTop: -SWIPE_OVERLAP, paddingTop: SWIPE_OVERLAP + 4, paddingHorizontal: '7%', paddingBottom: 8,
    backgroundColor: '#F5F5F5', borderTopWidth: 1, borderTopColor: '#808080',
  },

  noMore: { flex: 1, backgroundColor: '#F5F5F5' },
  noMoreContent: { paddingHorizontal: '7%', paddingTop: 32 },
  noMoreTitle: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  noMoreText: { fontWeight: '500' },
  blackBtn: { backgroundColor: '#222', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  blackBtnText: { color: '#fff', fontWeight: '600' },
});