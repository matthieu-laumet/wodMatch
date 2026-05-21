import { useContext, useEffect, useState } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { useNavigate } from "react-router-dom";
import OnboardPhotos from "./OnboardPhotos";
import OnboardStrength from "./OnboardStrength";


const Onboarding = () => {
  const { onboardinSelectedMode } = useContext(dataApplicationsContext);

  const navigate = useNavigate();
  const [section, setSection] = useState(parseInt(sessionStorage.getItem('onboardSection'), 10) || 0);

  const handlePrev = () => {
    if (section === 0) return navigate('/')
    setSection((prev) => prev - 1)
    window.scroll(0, 0);
  };

  const handleNext = () => {
    setSection((prev) => prev + 1)
    window.scroll(0, 0);
  };

  useEffect(() => {
    sessionStorage.setItem('onboardSection', section)
  }, [section])

  return (
    <div className="min-h-[calc(100dvh-60px)] px-[8%] pt-6 flex flex-col">
      <div className="flex">
        <i className="bi bi-arrow-left-circle text-3xl cursor-pointer" onClick={handlePrev}></i>
        <span className="progress-bar" style={{ "--progress": `${((section + 1) / 4) * 100}%` }}></span>
      </div>
      {section === 0 && <OnboardPhotos />}
      {section === 1 && <OnboardStrength />}
      <div className="mt-auto pb-6">
        <button
        onClick={handleNext}
          // disabled={photos.length === 0}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all
            ${true ? 'bg-[#222] active:scale-95' : 'bg-[#222] opacity-40 cursor-not-allowed'}`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Onboarding;