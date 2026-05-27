import { useContext, useEffect, useState } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { useNavigate } from "react-router-dom";
import OnboardPhotos from "./OnboardPhotos";
import OnboardSkills from "./OnboardSkills";
import OnboardAboutMe from "./OnboardAboutMe";


const Onboarding = () => {
  const { onboardinSelectedMode } = useContext(dataApplicationsContext);

  const navigate = useNavigate();
  const [section, setSection] = useState(parseInt(sessionStorage.getItem('onboardSection'), 10) || 0);
  const [isDisabled, setIsDisabled] = useState(true);

  const handlePrev = () => {
    if (section === 0) return navigate('/')
    setSection((prev) => prev - 1)
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
      {section === 0 && <OnboardPhotos setSection={setSection} isDisabled={isDisabled} setIsDisabled={setIsDisabled}/>}
      {section === 1 && <OnboardSkills setSection={setSection} isDisabled={isDisabled} setIsDisabled={setIsDisabled}/>}
      {section === 2 && <OnboardAboutMe setSection={setSection} isDisabled={isDisabled} setIsDisabled={setIsDisabled}/>}
    </div>
  );
};

export default Onboarding;