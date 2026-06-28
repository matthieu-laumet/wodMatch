import { useState } from "react";
import GetImage from "../../components/GetImage";
import { liaisonVille } from "../../components/textTransform";
import { useToggleUserCompetFavorisMutation } from "../../slices/favoritesApiSlice";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";

export default function CompetitionCard({ competition, isFavorite, showFavorite = true }) {

  const [toggleUserCompetFavoris] = useToggleUserCompetFavorisMutation();
  const [isStarred, setIsStarred] = useState(isFavorite);
  const navigate = useNavigate();

  if (!competition) return (
    <div className="flex justify-center items-center h-screen">
      <PulseLoader color="#222" />
    </div>
  );

  const minPrice = Math.min(...competition.divisions.map(d => d.price));
  const maxPrice = Math.max(...competition.divisions.map(d => d.price));
  const date = new Date(competition.begin);
  const day = date.getDate();
  const month = date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
  const price = minPrice === 0 ? 'Gratuit' : `${minPrice}${(minPrice !== maxPrice) ? `-${maxPrice}` : ''} €`;

  const competitionModes = [...competition.event_mode].sort((a, b) => a.order - b.order).map(mode => {
    return `#${mode.mode} `
  });

  const handleFavorite = async () => {
    setIsStarred(prev => !prev); // optimistic update
    try {
      await toggleUserCompetFavoris({ id_competition: competition.id_competition });
    } catch (error) {
      setIsStarred(prev => !prev); // rollback si erreur
    }
  }

  const handleClickCompetition = () => {
    navigate(`/competitions/${competition.id_competition}`);
  }

  return (
    <div 
      className="flex items-center gap-4 py-6 border-b border-[#A9A9A9] cursor-pointer" 
      onClick={handleClickCompetition}
    >
      <div className="flex flex-col items-center min-w-[60px]">
        <div className="flex gap-2 items-baseline mb-1">
          <span className="text-xl font-black">{day}</span>
          <span className="text-sm font-semibold">{month}</span>
        </div>
        <GetImage src={competition?.img_small} className={"card-compet-img"}/>
        <span className="text-sm mt-1 font-medium">{price}</span>
      </div>
      <div className="w-px h-20 bg-[#A9A9A9]" />
      <div className="flex flex-col grow">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-[#808080]">{competitionModes}</p>
          {showFavorite && <i className={`bi ${isStarred ? 'bi-star-fill' : 'bi-star'} cursor-pointer text-xl`} onClick={handleFavorite}></i>}
        </div>
        <h4 className="font-bold text-base uppercase mt-1">{competition.name}</h4>
        {competition.distance && !competition.location?.includes(competition.queryMatchCity) && (
          <div className="flex items-center gap-2 mt-2 opacity-50">
            <img src="/images/picto/distance.svg" alt="picto-distance" className="small-picto"/>
            <span className="text-sm font-medium">{competition.distance} km {liaisonVille(competition.queryMatchCity)}</span>
          </div>
        )}
        <div className="flex items-start gap-2 mt-1 text-sm">
          <i className="bi bi-geo-alt-fill card-geo-icon"></i>
          <span className="font-medium">{competition.compet_adresse?.trim()}, {showFavorite && <br/>}{competition.compet_code_postal} {competition.compet_ville}</span>
        </div>
      </div>
    </div>
  )
}