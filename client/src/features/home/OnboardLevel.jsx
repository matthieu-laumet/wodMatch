import { useEffect, useState } from "react";
import { useGetLevelsQuery } from "../../slices/levelsApiSlice";
import { PulseLoader } from "react-spinners";


const OnboardLevel = ({ setBtnText = null, setIsDisabled = null, userLevels, onLevelsChange }) => {

  const { data: levels, isLoading: isLoadingLevels, isSuccess: isSuccessLevels } = useGetLevelsQuery();
  const [selectedlevels, setSelectedLevels] = useState(() => {
    const saved = sessionStorage.getItem("onBoardingLevels");
    if (userLevels) return userLevels;
    return saved ? JSON.parse(saved) : [];
  });

  const handleSelect = (level) => {
    setSelectedLevels((prev) => {
      const exists = prev.find((s) => s.id_level === level.id_level);
      if (exists && prev.length === 1) return prev;
      const next = exists
        ? prev.filter((s) => s.id_level !== level.id_level)
        : [...prev, level];
      !userLevels && sessionStorage.setItem("onBoardingLevels", JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    onLevelsChange?.(selectedlevels);
  }, [selectedlevels]);

  useEffect(() => {
    if (setIsDisabled) {
      setIsDisabled(selectedlevels.length === 0);
    }
  }, [selectedlevels]);

  useEffect(() => {
    if (setBtnText) {
      setBtnText(`Terminer`)
    }
  }, []);

  if (isLoadingLevels) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <>
      <div className={`onboard-skill ${userLevels ? 'mt-4' : 'mb-10'}`}>
        {!userLevels &&
          <div className="mt-2 mb-0">
            <h2 className="text-2xl font-semibold mb-2">Quel est ton niveau de Fitness ?</h2>
            <p>Promis c’est la dernière étape.<br/>Tu peux choisir plusieurs propositions</p>
          </div>
        }
      </div>
      <div className={"mt-0"}>
        {levels.map(level => {
          const id_level = level.id_level;
          const isSelected = selectedlevels.some(s => s.id_level === id_level);
          return (
            <button 
              key={id_level} onClick={() => handleSelect(level)} 
              className={`btn-select ${isSelected ? "active" : ""} ${userLevels ? 'small' : ''}`}
            >
              <div className="btn-select-icon">
                <img src={level.icon} alt='icon-level' className={'icon-level'}/>
              </div>
              <span className="level-label font-semibold">{level.label}</span>
            </button>
          )
        })}
      </div>
    </>
  );
};

export default OnboardLevel;