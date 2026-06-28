import { useContext, useEffect, useMemo, useState } from "react";
import dataApplicationsContext, { MAXPRICE, MINPRICE } from "../../context/dataApplicationsContext";
import { useHandleHideUserProfilMutation } from "../../slices/usersApiSlice";
import Tags from "./Tags";
import { useGetEventModesQuery, useGetTagsQuery } from "../../slices/tagsApiSlice";
import { useGetWZCompetitionsQuery } from "../../slices/competitionsApiSlice";
import CompetitionCard from "./CompetitionCard";
import SearchCompet from "./SearchCompet";
import { useGetUserCompetFavoritesQuery } from "../../slices/favoritesApiSlice";

export default function Competitions() {
  const { auth, setAuth, filters, setFilters, windowWidth } = useContext(dataApplicationsContext);

  const { data: tags, isLoading: isLoadingtags, isError: isErrortags, isSuccess: isSuccesstags } = useGetTagsQuery();
  const { data: favorites } = useGetUserCompetFavoritesQuery();
  const { data: eventModes, isLoading: isLoadingEventModes, isError: isErrorEventModes, isSuccess: isSuccessEventModes } = useGetEventModesQuery();
  const { data: competitions, isLoading: isLoadingCompetition, isError: isErrorCompetition, isSuccess: isSuccessCompetition } = useGetWZCompetitionsQuery();

  const [displayCompetitions, setDisplayCompetitions] = useState([]);
  const [handleHideUserProfil] = useHandleHideUserProfilMutation();
  const widthCondition = windowWidth > 1021;

  const filterConditions = filters?.length > 2 
    || ((filters[0].minPrice > MINPRICE 
    || filters[0].maxPrice < MAXPRICE) || filters[1].departements.length > 0);

  const filteredCompetitionResults = useMemo(() => {
    if (!isSuccessCompetition) return [];
    let result = competitions;
    if (filterConditions) {
      const filterWithoutObject = [...filters].slice(2);
      result = competitions.filter(compet => {
        const eventModeSlugs = isSuccessEventModes ? eventModes.map(mode => mode.event_mode_slug) : [];
        const tagSlugs = isSuccesstags ? tags.map(tag => tag.tag_slug) : [];
        const conditions = [];
        const competModes = compet.event_mode.map(mode => mode.event_mode_slug);
        const competTags = compet?.tags?.map(tag => tag.tag_slug);
        const filterCompetModes = filterWithoutObject.filter(mode => eventModes?.filter(item => item.event_mode_slug === mode))  // filtre uniquement les modes selectionner dans le filtre
        const filterCompetTags = filterWithoutObject.filter(tag => tags.some(item => item.tag_slug === tag))  // filtre uniquement les modes selectionner dans le filtre

        // // filtrer par mode
        filterWithoutObject.some(type => eventModeSlugs?.includes(type.toLowerCase())) && 
          conditions.push(filterCompetModes.every(item => competModes.includes(item)));
        
        //Filtrer par tags
        (isSuccesstags && filterWithoutObject.some(type => tagSlugs.includes(type.toLowerCase()))) 
          && conditions.push(filterCompetTags.every(item => competTags?.includes(item)));

        return conditions.length === 0 || conditions.every(condition => condition);
      })
    }
    return result;
  }, [competitions, filters, filterConditions, isSuccessCompetition]);

  useEffect(() => {
    setDisplayCompetitions(filteredCompetitionResults);
  }, [filteredCompetitionResults]);

  const displayProfile = async () => {
    try {
      await handleHideUserProfil({ is_hidden: false });
      setAuth(prev => ({ ...prev, user: { ...prev.user, is_hidden: false } }));
    } catch (error) {
      console.log(error);
    }
  };

  if (auth.user.is_hidden) {
    return (
      <div className="full-screen pl-12 pr-12 pt-12 flex flex-col bg-profil-hiiden">
        <h3 className="text-2xl font-semibold">Ton profil est maqué</h3>
        <p className="mt-6 mb-6">
          Les WODs ne se font pas solo. Réaffiche ton profil pour retrouver ta prochaine équipe.
          Les Burppes, c'est quand même plus sympa à plusieurs
        </p>
        <button className="btn black px-12 py-4" onClick={displayProfile}>
          Ré-Afficher mon profil
        </button>
      </div>
    );
  }

  const isActive = (name) => {
    return (filters.includes(name) && filters.length === 3) ? 'active' : '';
  };

  const tagImages = isSuccesstags ? tags.filter(tag => tag.tag_img) : [];

  const handleClicIconFilterRapide = (e) => {
    const filterValue = e.target.getAttribute('data-filter');
    if (filters.includes(filterValue)) {
      setFilters([{ minPrice: 0, maxPrice: 500 }, { departements: [] }]);
      localStorage.setItem('filters', JSON.stringify([{ minPrice: 0, maxPrice: 500 }, { departements: [] }]));
    } else {
      setFilters([{ minPrice: 0, maxPrice: 500 }, { departements: [] }, filterValue]);
      localStorage.setItem('filters', JSON.stringify([{ minPrice: 0, maxPrice: 500 }, { departements: [] }, filterValue]));
    }
    // windowWidth < 781 && window.scrollTo({ top: 120, left: 0, behavior: "smooth" });
  };

  const groupedByYear = displayCompetitions.reduce((acc, competition) => {
    const year = new Date(competition.begin).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(competition);
    return acc;
  }, {});

  const handleReset = () => {
    setFilters([{ minPrice: 0, maxPrice: 500 }, {departements: []}]);
    if (document.querySelectorAll('.dep-svg.active')) {
      document.querySelectorAll('.dep-svg.active').forEach(function(element) {  // remove all active departements
        element.classList.remove('active');
      });
    }
  } 

  return (
    <div className='pb-20'>
      <div className="competition-header padding7p">
        <h3 className="font-bold text-2xl">Liste des compétitions</h3>
        <p className="mt-2 text-md">
          Choisis ta compétition et trouve les coéquipiers qu'il te manque.
          N'hésite pas à les mettre en favoris pour faciliter ton expérience
        </p>
        <SearchCompet
          competitions={filteredCompetitionResults} setDisplayCompetitions={setDisplayCompetitions}
        />
        <Tags
          tagImages={tagImages.filter(tag => tag.id_tag !== 11)} isActive={isActive} handleClicIconFilterRapide={handleClicIconFilterRapide}
          widthCondition={widthCondition}
        />
      </div>
      <div className="competitions-cards-container padding7p pt-6">
        {(filters.length > 0 && displayCompetitions.length === 0 && isSuccessCompetition) && 
          <>
            <p className="text-xl font-semibold">Oupss ! Aucune correspondance exacte...</p>
            <p className="font-medium mt-4">
              Modifiez ou supprimez certains de vos filtres ou ajustez votre zone de recherche.
            </p>
            <button onClick={handleReset} className={`filtre-btn-reset mt-4`}>Supprimer les filtres</button>
          </>
        }
        {Object.entries(groupedByYear)
          .sort(([a], [b]) => a - b)
          .map(([year, comps]) => (
            <div key={year}>
              <h4 className="font-bold pb-2 border-b border-[#A9A9A9] mb-2">{year}</h4>
              {comps.map(competition => (
                <CompetitionCard 
                  key={competition.id_competition} competition={competition} 
                  isFavorite={favorites?.some(f => f.id_competition === competition.id_competition)}
                />
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
}