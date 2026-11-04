import {
  ActivityIndicator, Pressable, StyleSheet, ScrollView, Text, View,
  type ScrollViewInstance,
} from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useCompetition, useHandleUserSearchMode, useSearchModes, useTeamsFeed } from '../../../hooks/queries';
import CompetitionCard from '../../../components/CompetitionCard';
import SwipeElement from '../../../components/SwipeElement';
import SearchFiltersModal from '@/components/SearchFiltersModal';
import ParticipantDetails from '@/components/ParticipantDetails';
import { searchingLabel } from '@/lib/team';
import { imageUrl } from '@/lib/images';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSwipe } from '@/hooks/queries';

const HERO_IMAGE = 'https://res.cloudinary.com/dkz9knsgj/image/upload/v1792680394/magnific_2d-cartoon-illustration-l_NZlNgRl6D9_mecnb0_e7hvgy.png';
const NO_MORE_IMAGE = 'https://res.cloudinary.com/dkz9knsgj/image/upload/v1782660790/drilldown_ptcaiy.jpg';

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
  const { data: feed, isLoading: feedLoading, error: feedError, fetchStatus } = useTeamsFeed(Number(id_competition));
  const changeMode = useHandleUserSearchMode();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [heroH, setHeroH] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const profile = feed?.[0];
  const photos = (profile?.photos ?? []).map(imageUrl).filter(Boolean) as string[];

  const { width } = useWindowDimensions();
  const THRESHOLD = width * 0.3;
  const x = useSharedValue(0);
  const busy = useRef(false);
  const swipe = useSwipe(Number(id_competition));

  // Nouveau profil : on remet la carte en place et on ferme les détails
  useEffect(() => {
    x.value = 0;
    busy.current = false;
    setDetailsOpen(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [profile?.id_team]);


  const commit = (direction: 'like' | 'pass') => {
    if (!profile) return;
    swipe.mutate(
      { id_team_to: profile.id_team, direction },
      {
        onSuccess: res => { if (res.match) { /* TODO: modal "C'est un match" */ } },
        onError: () => { x.value = withTiming(0); busy.current = false; },
      },
    );
  };

  // Utilisé par les boutons ET par le geste
  const fling = (direction: 'like' | 'pass') => {
    if (busy.current || !profile) return;
    busy.current = true;
    x.value = withTiming((direction === 'like' ? 1 : -1) * width * 1.3, { duration: 220 }, finished => {
      if (finished) runOnJS(commit)(direction);
    });
  };

  const pan = Gesture.Pan()
    .enabled(!detailsOpen)
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onUpdate(e => { x.value = e.translationX; })
    .onEnd(e => {
      if (Math.abs(e.translationX) > THRESHOLD || Math.abs(e.velocityX) > 900) {
        runOnJS(fling)(e.translationX > 0 ? 'like' : 'pass');
      } else {
        x.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { rotate: `${interpolate(x.value, [-width, 0, width], [-12, 0, 12])}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));
  
  useEffect(() => {
    setPhotoIndex(0);
    photos.forEach(u => Image.prefetch(u));
  }, [profile?.id_team]);

  const avatar = profile?.members?.[0]?.avatar;
  const heroUri = photos[photoIndex] ?? (typeof avatar === 'string' && avatar.startsWith('http') ? avatar : null) ?? HERO_IMAGE;

  const nextPhoto = () => setPhotoIndex(i => Math.min(i + 1, photos.length - 1));
  const prevPhoto = () => setPhotoIndex(i => Math.max(i - 1, 0));

  const toggleDetails = () => {
    if (detailsOpen) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    setDetailsOpen(v => !v);
  };

  if (isLoading || feedLoading) {
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
  if (feedError) {
    return (
      <View style={s.center}>
        <Text>Impossible de charger les profils.</Text>
      </View>
    );
  }
  if (!profile) return <NoMoreProfiles />;

  return (
    <View style={s.root}>
      {detailsOpen && (
        <View style={s.detailsHeader}>
          <Ionicons name="people" size={28} color="#222" />
          <Text style={s.detailsTitle} numberOfLines={1}>{profile.name}</Text>
          <Pressable hitSlop={8} onPress={toggleDetails}>
            <Ionicons name="close-circle-outline" size={34} color="#444" />
          </Pressable>
        </View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, cardStyle]}>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            scrollEnabled={detailsOpen}
            onLayout={e => { if (!detailsOpen) setHeroH(e.nativeEvent.layout.height); }}
            contentContainerStyle={{ paddingBottom: detailsOpen ? insets.bottom - 30 : 0 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[s.hero, { height: heroH }]}>
              <Image source={{ uri: heroUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <LinearGradient
                colors={[
                  'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0)',
                  'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)',
                ]}
                locations={[0, 0.1, 0.3, 0.55, 0.8, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              
              {/* Zones de tap façon Tinder : gauche = précédente, droite = suivante */}
              {photos.length > 1 && (
                <View style={s.tapZones}>
                  <Pressable style={s.tapLeft} onPress={prevPhoto} />
                  <Pressable style={s.tapRight} onPress={nextPhoto} />
                </View>
              )}

              <View style={[s.modeHeader, { paddingTop: 16 }]} pointerEvents="box-none">
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
                <Pressable hitSlop={8} onPress={() => setFiltersOpen(true)}>
                  <Ionicons name="options-outline" size={36} color="#fff" style={s.shadow} />
                </Pressable>
              </View>

              {photos.length > 1 && (
                <View style={s.dots} pointerEvents="none">
                  {photos.map((_, i) => (
                    <View key={i} style={[s.dot, i === photoIndex && s.dotActive]} />
                  ))}
                </View>
              )}

              <View style={s.participant} pointerEvents="box-none">
                <View>
                  <Text style={[s.pName, s.shadow]}>{profile.name}</Text>
                  <Text style={[s.pText, s.shadow]}>{searchingLabel(profile.searching)}</Text>
                  <Text style={[s.pText, s.shadow]}>Catégorie {profile.division.name}</Text>
                </View>
                <Pressable hitSlop={8} onPress={toggleDetails}>
                  <Ionicons name="share-outline" size={30} color="#fff" style={s.shadow} />
                </Pressable>
              </View>
            </View>

            {detailsOpen && <ParticipantDetails profile={profile} competition={competition} />}
          </ScrollView>
          <Animated.View style={[s.stamp, s.stampLike, likeStyle]} pointerEvents="none">
            <Text style={[s.stampText, { color: '#87BA7E' }]}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[s.stamp, s.stampNope, nopeStyle]} pointerEvents="none">
            <Text style={[s.stampText, { color: '#f87171' }]}>NO REP</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

        {detailsOpen ? (
          <>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
              locations={[0, 0.75, 1]}
              style={[s.fade, { height: 130 }]}
              pointerEvents="none"
            />
            <View style={[s.swipeBar, { bottom: insets.bottom + 8 }]} pointerEvents="box-none">
              <View style={[s.swipeBar, { bottom: -16 }]} pointerEvents="box-none">
                <SwipeElement variant="compact" onPass={() => fling('pass')} onLike={() => fling('like')} />
              </View>
            </View>
          </>
        ) : (
        <View style={s.footerWrap} pointerEvents="box-none">
          <View style={s.swipe} pointerEvents="box-none">
            <SwipeElement onPass={() => fling('pass')} onLike={() => fling('like')} />
          </View>
          <View style={s.footer}>
            <CompetitionCard competition={competition} isFavorite={false} showFavorite={false} isLast disabled />
          </View>
        </View>
      )}

      <SearchFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={filters => console.log('filtres', filters)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: '7%',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9',
  },
  tapZones: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },   // zone droite plus large, comme Tinder
  dots: { flexDirection: 'row', justifyContent: 'flex-start', gap: 6, marginTop:12, marginLeft: 32 },
  dot: {
    width: 10, height: 10, borderRadius: 99,
    backgroundColor: 'rgba(222, 221, 221, 0.5)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,1)',
  },
  dotActive: { backgroundColor: '#fff' },
  detailsTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#222' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  swipeBar: { position: 'absolute', left: 0, right: 0 },
  swipeFloating: { position: 'absolute', left: 0, right: 0 },
  root: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {},
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
    paddingBottom: SWIPE_OVERLAP + 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
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
  noMoreTitle: { fontSize: 32, fontWeight: '600', marginBottom: 12 },
  noMoreText: { fontWeight: '500', fontSize: 16, lineHeight: 22 },
  blackBtn: { backgroundColor: '#222', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  blackBtnText: { color: '#fff', fontWeight: '600' },
  stamp: {
    position: 'absolute', top: 90,
    borderWidth: 4, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',   // fond blanc : lisible sur toute photo
  },
  stampLike: { left: 24, borderColor: '#87BA7E', transform: [{ rotate: '-12deg' }] },
  stampNope: { right: 24, borderColor: '#f87171', transform: [{ rotate: '12deg' }] },
  stampText: { fontSize: 36, fontWeight: '900', letterSpacing: 2 },
});