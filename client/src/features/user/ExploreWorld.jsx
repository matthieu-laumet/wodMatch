import { useNavigate, useParams } from 'react-router-dom';
import { useGetWZCompetitionsQuery } from '../../slices/competitionsApiSlice';
import CompetitionCard from '../competitions/CompetitionCard';
import { PulseLoader } from "react-spinners";
import SwipeElement from '../../components/SwipeElement';
import { useGetSearchModesQuery, useHandleUserSearchModeMutation } from "../../slices/searchModesApiSlice";
import { useContext, useState } from 'react';
import dataApplicationsContext from '../../context/dataApplicationsContext';

export default function ExploreWorld({ }) {
  const { id_competition } = useParams();
  const { auth } = useContext(dataApplicationsContext);
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(auth.user.id_search_mode)
  const [handleUserSearchMode] = useHandleUserSearchModeMutation()

  const { data: searchModes, isLoading: isLoadingSearchModes, isSuccess: isSuccessSearchModes } = useGetSearchModesQuery();
  const { competition, isLoading, isSuccess } = useGetWZCompetitionsQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      isLoading,
      competition: data?.find(c => c.id_competition === Number(id_competition))
    })
  });

  const noMoreProfils = false;

  if (noMoreProfils) return (
    <div className='img-fullscreen padding7p pt-8'>
      <p className='font-semibold text-2xl mb-3'>Oupss...</p>
      <p className='font-medium'>Personne ne traîne à la box à cette heure-ci… Plus aucun coéquipier disponible pour cette compétition. Check les autres compétitions, ton équipe est peut-être ailleurs !</p>
      <button 
        className='btn black px-8 py-3 mt-4 cursor-pointer'
        onClick={() => navigate('/')}
      >
        Voir les autres compétitions
      </button>
    </div>
  )

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <PulseLoader color="#222" />
    </div>
  );

  const handleChangeMode = async (id_search_mode) => {
    try {
      await handleUserSearchMode({ id_search_mode })
      setActiveMode(id_search_mode);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="">
      <div className="main-section-container">
        <div className="mode-header-container pt-4 padding7p">
          <div className="flex gap-3">
            {searchModes?.map(mode => {
              const isActive = activeMode === mode.id_search_mode;
              return (
                <div 
                  key={mode.id_search_mode}
                  className={`mode-btn ${isActive ? 'active' : ''}`} 
                  onClick={() => handleChangeMode(mode.id_search_mode)}
                >
                  <img src={mode.icon} className='w-5 cursor-pointer'/>
                  {isActive && <p className='cursor-pointer'>{mode.label_short}</p>}
                </div>
              )
            })}
          </div>
          <i className="bi bi-sliders text-3xl cursor-pointer text-[#fff] shadow-text" />
        </div>
        <div className="participant-images-container">
          <img 
            src={'https://res.cloudinary.com/dkz9knsgj/image/upload/v1782672401/77a1611d746ad20a1728e672eb9d681450587978_dd17zo.jpg'} 
            className='full-image'
          />
        </div>
        <div className="participant-container padding7p">
          <div className="">
            <p className='font-semibold text-lg text-[#fff] mb-1 shadow-text'>Les pas là pour être ici</p>
            <p className='text-sm font-medium text-[#fff] shadow-text'>Recherche 1 athlète (F)</p>
            <p className='text-sm font-medium text-[#fff] shadow-text'>Niveau Inter</p>
          </div>
          <i className="bi bi-arrow-up-square text-3xl text-[#fff] cursor-pointer shadow-text"></i>
        </div>
      </div>
      <div className="footer-competition-container padding7p">
        <SwipeElement />
        <div className="mt-1">
          <CompetitionCard competition={competition} showFavorite={false}/>
        </div>
      </div>
    </div>
  )
}