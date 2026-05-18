import { useContext, useEffect } from "react"
import dataApplicationsContext from "../../context/dataApplicationsContext"
import TruncatedButton from "../workouts/TruncatedButton"
import { useNavigate } from "react-router-dom";

export default function UserOnglet({ 
  onglets, setStateToReinit, limitWidth, ongletActif, setOngletActif, classContainer, isForPaiment, containerRef,
  truncateBtn, maxWidth, isContainerOverflowing, handleNavigate, sliderRef, handleClickProp
}) {

  const { setActiveInput, ongletPaiementActif, setOngletPaiementActif } = useContext(dataApplicationsContext);
  const navigate = useNavigate()

  useEffect(() => {
    if (ongletPaiementActif === '' || (!ongletPaiementActif && !ongletActif)) {
      setOngletPaiementActif(onglets[0])
    }
    if (ongletActif === '') {
      setOngletActif && setOngletActif(onglets[0])
    }
  }, [])

  const handleClick = (onglet) => {
    if (handleClickProp) {
      handleClickProp(onglet)
    }
    isForPaiment && setOngletPaiementActif(onglet)
    setOngletActif && setOngletActif(onglet)
    setActiveInput(null)
    setStateToReinit && setStateToReinit(null)
    handleNavigate && navigate(`${handleNavigate}/${onglet.id}`)
    if (sliderRef && sliderRef.current) {
      sliderRef.current.slickGoTo(onglet.id);
    }
  }  

  return (
    <div className={`onglets-line-container ${limitWidth ?? ''} ${classContainer}`} ref={containerRef ?? null}>
      {onglets.map((onglet, index) => {
        const isActive = (ongletPaiementActif?.id === onglet.id || (ongletActif && ongletActif.id === onglet.id));
        const classes = `${onglet.moreClass} user-onglet ${isActive ? 'active' : ''}`;
        
        return (
          (truncateBtn && isContainerOverflowing) 
          ?  <TruncatedButton 
                text={onglet.label} maxWidth={maxWidth} key={index} buttonClass={`${classes} mt-0`} 
                handleClick={() => handleClick(onglet)} isActive={isActive}
              />
          :  <button key={index} className={classes} onClick={() => handleClick(onglet)} >
                {onglet.label}
              </button>
        )
      })}
    </div>
  )
}