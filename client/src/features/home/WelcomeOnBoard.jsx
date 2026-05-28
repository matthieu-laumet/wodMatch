import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { useGetSearchModesQuery } from "../../slices/searchModesApiSlice";
import { useState } from "react";

const WelcomeOnBoard = () => {
  const { data: searchModes, isLoading: isLoadingSearchModes, isSuccess: isSuccessSearchModes } = useGetSearchModesQuery();

  const [onboardinSelectedMode, setonboardinSelectedMode] = useState(() => {
    const saved = sessionStorage.getItem("onboardingChoice");
    return saved ? JSON.parse(saved) : null;
  });
  
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!onboardinSelectedMode) return
    navigate("/onboarding");
  };

  const handleSelect = (mode) => {
    setonboardinSelectedMode(mode)
    sessionStorage.setItem('onboardingChoice', mode)
  }

  if (isLoadingSearchModes) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <div className="min-h-[calc(100dvh-60px)] px-[8%] pt-6">
      <h2 className="font-black text-4xl text-center">Bienvenue sur WODMATCH</h2>
      <div className="flex gap-4 items-center mt-6">
        <FontAwesomeIcon icon={faTrophy} className="trophy"/>
        <p className="text-xl font-semibold">Swipe ton prochain coéquipier de podium™</p>
      </div>
      <div className="mt-6">
        <p className="font-medium">
          <span className="font-bold text-lg">WODMATCH</span> rassemble les athlètes qui souhaitent compléter leur team pour la prochaine compet. 
          Trouve alors ton prochain binôme, complète ta team, et monte sur le podium 💪
        </p>
      </div>
      <div className="mt-8">
        <p className="text-lg font-semibold mb-0">Choisis ton mode</p>
        <p className="text-base">Tu pourras changer à tout moment</p>
      </div>
      <div className="mt-4">
        {searchModes.map(mode => {
          const id_search_mode = mode.id_search_mode;
          return (
            <button key={id_search_mode} onClick={() => handleSelect(id_search_mode)} className={`btn-select ${onboardinSelectedMode === id_search_mode ? "active" : ""}`}>
              <div className="btn-select-icon">
                <img src={mode.icon} alt='icon-level' className={'icon-level small'}/>
              </div>
              <span className="font-semibold">{mode.label}</span>
            </button>
          )
        })}
      </div>
      <button
        onClick={handleNext}
        disabled={!onboardinSelectedMode}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all mt-2 bg-black
          ${onboardinSelectedMode ? "active:scale-95" : "opacity-40 cursor-not-allowed"}`}
      >
        Suivant
      </button>
    </div>
  );
};

export default WelcomeOnBoard;