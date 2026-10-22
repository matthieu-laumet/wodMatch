import { useMemo, useState } from 'react';
import { ImageBackground, ActivityIndicator, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFilters } from '../../context/FiltersContext';
import { useEventModes, useFavorites, useShowProfile, useTags, useWZCompetitions } from '../../hooks/queries';
import { useCompetitionSearch } from '../../hooks/useCompetitionSearch';
import { filterCompetitions } from '../../utils/filterCompetitions';
import CompetitionCard from '../../components/CompetitionCard';
import SearchCompet from '../../components/SearchCompet';
import Tags from '../../components/Tags';
import type { Competition } from '../../types/competition';
import { LinearGradient } from 'expo-linear-gradient';

function groupByYear(competitions: Competition[]) {
  const map = new Map<number, Competition[]>();
  for (const c of competitions) {
    const year = new Date(c.begin).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(c);
  }
  return [...map.entries()].sort(([a], [b]) => a - b).map(([year, data]) => ({ title: String(year), data }));
}

const HIDDEN_BG = 'https://res.cloudinary.com/dkz9knsgj/image/upload/v1792680394/magnific_2d-cartoon-illustration-l_NZlNgRl6D9_mecnb0_e7hvgy.png';
function HiddenProfile() {
  const showProfile = useShowProfile();
  return (
    <ImageBackground
      source={{ uri: HIDDEN_BG }}
      resizeMode="cover"
      style={s.bgHidden}
      imageStyle={{ transform: [{ translateY: 0 }] }} // descend le personnage de 80px
    >
      <LinearGradient
        colors={['rgb(245,245,245)', 'rgba(245,245,245,0.8)', 'rgba(245,245,245,0.1)']}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.hidden}
      >
        <Text style={s.hiddenTitle}>Ton profil est masqué</Text>
        <Text style={s.hiddenText}>
          Les WODs ne se font pas solo. Réaffiche ton profil pour retrouver ta prochaine équipe. Les Burpees, c'est
          quand même plus sympa à plusieurs
        </Text>
        <Pressable style={s.blackBtn} onPress={() => showProfile.mutate()} disabled={showProfile.isPending}>
          <Text style={s.blackBtnText}>Ré-Afficher mon profil</Text>
        </Pressable>
      </LinearGradient>
    </ImageBackground>
  );
}

function CompetitionList() {
  const { filters, toggleQuickFilter, resetFilters } = useFilters();
  const tagsQ = useTags();
  const modesQ = useEventModes();
  const competsQ = useWZCompetitions();
  const favQ = useFavorites();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterCompetitions(competsQ.data ?? [], filters, modesQ.data ?? [], tagsQ.data ?? []),
    [competsQ.data, filters, modesQ.data, tagsQ.data],
  );
  const { results, isSearching } = useCompetitionSearch(filtered, search);

  const favoriteIds = useMemo(() => new Set((favQ.data ?? []).map(f => f.id_competition)), [favQ.data]);
  const sections = useMemo(() => groupByYear(results), [results]);
  const quickTags = useMemo(() => (tagsQ.data ?? []).filter(t => t.tag_img && t.id_tag !== 11), [tagsQ.data]);
  const activeSlug = filters.slugs.length === 1 ? filters.slugs[0] : null;

  const handleReset = () => {
    resetFilters();
    setSearch('');
  };

  if (competsQ.isLoading) {
    return <View style={s.center}><ActivityIndicator /></View>;
  }
  if (competsQ.isError) {
    return (
      <View style={s.center}>
        <Text>Impossible de charger les compétitions.</Text>
        <Pressable style={[s.blackBtn, { marginTop: 16 }]} onPress={() => competsQ.refetch()}>
          <Text style={s.blackBtnText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const header = (
    <View style={s.header}>
      <View style={s.headerInner}>
        <Text style={s.title}>Liste des compétitions</Text>
        <Text style={s.subtitle}>
          Choisis ta compétition et trouve les coéquipiers qu'il te manque. N'hésite pas à les mettre en favoris pour
          faciliter ton expérience
        </Text>
        <SearchCompet value={search} onChangeText={setSearch} isLoading={isSearching} />
      </View>
      <Tags tags={quickTags} activeSlug={activeSlug} onPress={toggleQuickFilter} />
    </View>
  );

  const empty = (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>Oupss ! Aucune correspondance exacte...</Text>
      <Text style={s.emptyText}>Modifiez ou supprimez certains de vos filtres ou ajustez votre zone de recherche.</Text>
      <Pressable style={s.resetBtn} onPress={handleReset}>
        <Text>Supprimer les filtres</Text>
      </Pressable>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={c => String(c.id_competition)}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      renderSectionHeader={({ section }) => (
        <View style={[s.yearWrapper, section.title !== sections[0]?.title && s.yearNotFirst]}>
          <Text style={s.year}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item, index, section }) => (
        <View style={s.cardWrapper}>
          <CompetitionCard
            competition={item}
            isFavorite={favoriteIds.has(item.id_competition)}
            isLast={index === section.data.length - 1}
          />
        </View>
      )}
      stickySectionHeadersEnabled
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={competsQ.isRefetching} onRefresh={() => competsQ.refetch()} />}
    />
  );
}

export default function Competitions() {
  const { user } = useAuth();
  return user?.is_hidden ? <HiddenProfile /> : <CompetitionList />;
}

const s = StyleSheet.create({
  bgHidden: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardWrapper: { paddingHorizontal: '7%' },
  yearNotFirst: { paddingTop: 24 },
  yearWrapper: { backgroundColor: '#F5F5F5' },
  year: { fontWeight: '700', paddingHorizontal: '7%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#A9A9A9' },
  content: { paddingBottom: 80 },
  header: { paddingTop: 24, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#808080' },
  headerInner: { paddingHorizontal: '7%' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 8, fontSize: 15 },
  empty: { paddingHorizontal: '7%', paddingTop: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600' },
  emptyText: { marginTop: 16, fontWeight: '500' },
  resetBtn: { marginTop: 16, alignSelf: 'flex-start', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#808080', backgroundColor: '#fff' },
  hidden: { flex: 1, padding: 30, paddingTop: 24 },
  hiddenTitle: { fontSize: 24, fontWeight: '600' },
  hiddenText: { marginVertical: 24 },
  blackBtn: { backgroundColor: '#222', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 6, alignItems: 'center' },
  blackBtnText: { color: '#fff', fontWeight: '600' },
});