import { useEffect, useState } from "react";
import { useGetLevelsQuery } from "../../slices/levelsApiSlice";
import { PulseLoader } from "react-spinners";


const OnboardLevel = ({ setBtnText, setIsDisabled }) => {

  const { data: levels, isLoading: isLoadingLevels, isSuccess: isSuccessLevels } = useGetLevelsQuery();
  const [selectedlevels, setSelectedLevels] = useState(() => {
    const saved = sessionStorage.getItem("onBoardingLevels");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSelect = (mode) => {
    console.log(mode)
    setSelectedLevels(prev => {
      const updated = prev.includes(mode) ? prev.filter(l => l !== mode) : [...prev, mode];
      sessionStorage.setItem('onBoardingLevels', JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    setIsDisabled(selectedlevels.length === 0);
  }, [selectedlevels]);

  useEffect(() => {
    setBtnText(`Terminer`)
  }, []);

  if (isLoadingLevels) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <>
      <div className="onboard-skill mb-10">
        <div className="mt-2 mb-0">
          <h2 className="text-2xl font-semibold mb-2">Quel est ton niveau de Fitness ?</h2>
          <p>Promis c’est la dernière étape.<br/>Tu peux choisir plusieurs propositions</p>
        </div>
      </div>
      <div className="mt-0">
        {levels.map(level => {
          const id_level = level.id_level;
          return (
            <button key={id_level} onClick={() => handleSelect(id_level)} className={`btn-select ${selectedlevels.includes(id_level) ? "active" : ""}`}>
              <div className="btn-select-icon">
                <img src={level.icon} alt='icon-level' className={'icon-level'}/>
              </div>
              <span className="font-semibold">{level.label}</span>
            </button>
          )
        })}
      </div>
    </>
  );
};

export default OnboardLevel;