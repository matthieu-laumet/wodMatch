import { faTrophy, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import dataApplicationsContext from "../../context/dataApplicationsContext";

const WelcomeOnBoard = () => {
  const { onboardinSelectedMode, setonboardinSelectedMode } = useContext(dataApplicationsContext);
  
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!onboardinSelectedMode) return
    navigate("/onboarding");
  };

  const handleSelect = (mode) => {
    setonboardinSelectedMode(mode)
    sessionStorage.setItem('onboardingChoice', mode)
  }

  return (
    <div className="h-[calc(100dvh-60px)] px-[8%] pt-6">
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
        <button
          onClick={() => handleSelect("solo")}
          className={`flex items-center gap-3 w-full p-4 rounded-xl border mb-3 text-left transition-all
            ${onboardinSelectedMode === "solo"
              ? "border-black border-2 bg-black/5 text-gray-900"
              : "border-gray-400 bg-white"
            }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 `}>
            <FontAwesomeIcon icon={faUser} className="text-lg"/>
          </div>
          <span className="font-semibold">Je suis seul, et cherche une team</span>
        </button>
        <button
          onClick={() => handleSelect("team")}
          className={`flex items-center gap-3 w-full p-4 rounded-xl border mb-4 text-left transition-all
            ${onboardinSelectedMode === "team"
              ? "border-black border-2 bg-black/5 text-gray-900"
              : "border-gray-400 bg-white"
            }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0`}>
            <FontAwesomeIcon icon={faUsers} className="text-lg"/>
          </div>
          <span className="font-semibold">Notre team cherche des membres</span>
        </button>
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