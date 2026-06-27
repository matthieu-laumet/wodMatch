import { useContext, useState } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { useHandleHideUserProfilMutation } from "../../slices/usersApiSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import Tags from "./Tags";
import { useGetTagsQuery } from "../../slices/tagsApiSlice";
import { useGetWZCompetitionsQuery } from "../../slices/competitionsApiSlice";
import CompetitionCard from "./CompetitionCard";

export default function Competitions({ }) {
  const { auth, setAuth, filterCompetitions, setFilterCompetitions, windowWidth } = useContext(dataApplicationsContext);

  const { data: tags, isLoading: isLoadingtags, isError: isErrortags, isSuccess: isSuccesstags } = useGetTagsQuery();
  const { data: competitions, isLoading: isLoadingCompetition, isError: isErrorCompetition, isSuccess: isSuccessCompetition } = useGetWZCompetitionsQuery();

  const [searchCompetition, setSearchCompetition] = useState('');
  const [handleHideUserProfil] = useHandleHideUserProfilMutation();
  const widthCondition = windowWidth > 1021;

  const handleReset = (e) => {
    setSearchCompetition('')
  }

  const displayProfile = async () => {
    try {
      await handleHideUserProfil({ is_hidden: false });
      setAuth(prev => ({ ...prev, user: { ...prev.user, is_hidden: false } }));
    } catch (error) {
      console.log(error)
    }
  }

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
    )
  }

  const isActive = (name) => {
    return (filterCompetitions.includes(name) && filterCompetitions.length === 3) ? 'active' : '';
  }
  const tagImages = isSuccesstags ? tags.filter(tag => tag.tag_img) : [];

  const handleClicIconFilterRapide = (e) => {
    const filterValue = e.target.getAttribute('data-filter');
    if (filterCompetitions.includes(filterValue)) {
      setFilterCompetitions([{ minPrice: 0, maxPrice: 500 }, {departements: []}]);
      localStorage.setItem('filterCompetitions', JSON.stringify([{ minPrice: 0, maxPrice: 500 }, {departements: []}]));
    } else {
      setFilterCompetitions([{ minPrice: 0, maxPrice: 500 }, {departements: []}, filterValue]);      
      localStorage.setItem('filterCompetitions', JSON.stringify([{ minPrice: 0, maxPrice: 500 }, {departements: []}, filterValue]));
    }
    windowWidth < 781 && window.scrollTo({ top: 180, left: 0, behavior: "smooth" });
  }

  const groupedByYear = competitions?.reduce((acc, competition) => {
    const year = new Date(competition.begin).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(competition);
    return acc;
  }, {});

  return (
    <div className='pb-20'>
      <div className="competition-header padding7p">
        <h3 className="font-bold text-2xl">Liste des compétitions</h3>
        <p className="mt-2 text-md">
          Choisis ta compétition et trouve les coéquipiers qu’il te manque. 
          N’hésite pas à les mettre en favoris pour faciliter ton expérience
        </p>
        <div className="flex justify-between mt-5 items-baseline gap-8">
          <div className={`relative grow`}>
            <i className={`bi bi-search search-icon`}></i>
            {(searchCompetition.length > 0) && <i className={`bi bi-x-lg search-icon close`} onClick={handleReset}></i>}
            <input 
              autoComplete="off" 
              type="text" 
              className='search-bar-compet'
              placeholder={'Rechercher une compet'}
              value={searchCompetition}
              onChange={(e) => setSearchCompetition(e.target.value)}
            />
          </div>
          <i className="bi bi-sliders text-2xl cursor-pointer"></i>
        </div>
        <Tags 
          tagImages={tagImages} isActive={isActive} handleClicIconFilterRapide={handleClicIconFilterRapide} 
          widthCondition={widthCondition}
        />
      </div>
      <div className="competitions-cards-container padding7p pt-6">
        {groupedByYear && Object.entries(groupedByYear)
          .sort(([a], [b]) => a - b)
          .map(([year, comps]) => (
            <div key={year}>
              <div className="flex items-center gap-2">
                <i className="bi bi-chevron-down"></i>
                <h4 className="font-bold">{year}</h4>
              </div>
              <hr />
              {comps.map(competition => (
                <CompetitionCard key={competition.id_competition} competition={competition} />
              ))}
            </div>
          ))
        }
      </div>
    </div>
  )
}