import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardSkills from "./OnboardSkills";
import OnboardAboutMe from "./OnboardAboutMe";
import OnboardLevel from "./OnboardLevel";
import { useOnboardingUserMutation } from "../../slices/usersApiSlice";
import HandlePhotos from "../../components/HandlePhotos";
import dataApplicationsContext from "../../context/dataApplicationsContext";


const Onboarding = () => {
  const { setAuth } = useContext(dataApplicationsContext);

  const navigate = useNavigate();
  const [btnText, setBtnText] = useState('Suivant');
  const [section, setSection] = useState(parseInt(sessionStorage.getItem('onboardSection'), 10) || 0);
  const [isDisabled, setIsDisabled] = useState(true);

  const [onboardingUser] = useOnboardingUserMutation();

  const handlePrev = () => {
    if (section === 0) return navigate('/')
    setSection((prev) => prev - 1)
    window.scroll(0, 0);
  };

  const handleNext = async () => {
    if (isDisabled) return
    window.scroll(0, 0);
    if (section === 3) {
      return await handleSubmitOnboarding();
    }
    setSection((prev) => prev + 1)
  };


  useEffect(() => {
    sessionStorage.setItem('onboardSection', section)
  }, [section]);


  const handleSubmitOnboarding = async () => {
    try {
      const levels = JSON.parse(sessionStorage.getItem('onBoardingLevels'));
      const userBio = sessionStorage.getItem('onboardBio');
      const userFunReps = JSON.parse(sessionStorage.getItem('onboardFunReps'));
      const skills = JSON.parse(sessionStorage.getItem('onboardSkills'));
      const userSearchMode = JSON.parse(sessionStorage.getItem('onboardingChoice'));

      const result = await onboardingUser({
        levels, userBio, userFunReps, skills, userSearchMode
      }).unwrap();
      setAuth(prev => ({ ...prev, user: { ...prev.user, has_seen_wodmatch_welcome: result.has_seen_wodmatch_welcome } }));
      navigate('/profil');
      sessionStorage.removeItem('onBoardingLevels');
      sessionStorage.removeItem('onboardBio');
      sessionStorage.removeItem('onboardFunReps');
      sessionStorage.removeItem('onboardSkills');
      sessionStorage.removeItem('onboardingChoice');
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-60px)] px-[8%] pt-6 flex flex-col">
      <div className="flex">
        <i className="bi bi-arrow-left-circle text-3xl cursor-pointer" onClick={handlePrev}></i>
        <span className="progress-bar" style={{ "--progress": `${((section + 1) / 4) * 100 - 10}%` }}></span>
      </div>
      {section === 0 && <HandlePhotos setBtnText={setBtnText} setIsDisabled={setIsDisabled}/>}
      {section === 1 && <OnboardSkills setBtnText={setBtnText} setIsDisabled={setIsDisabled}/>}
      {section === 2 && <OnboardAboutMe setBtnText={setBtnText} setIsDisabled={setIsDisabled}/>}
      {section === 3 && <OnboardLevel setBtnText={setBtnText} setIsDisabled={setIsDisabled}/>}
      <div className="mt-auto pb-6">
        <button
          onClick={handleNext}
          disabled={isDisabled}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all
            ${isDisabled ? 'bg-[#222] opacity-40 cursor-not-allowed' : 'bg-[#222] active:scale-95'}`}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;