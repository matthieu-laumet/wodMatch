import { useEffect, useRef } from "react";
import { useScrollLock } from "../hooks/useScrollLock";

export default function ModalStructure({ 
  openModal, setOpenModal, title, body, btnText, onSubmit, hideOnFocuse, titleClass, cancelText = 'Annuler', wrapperClass,
  handleModalClose, noFooter, btnText2, submit2, titleSuffix
}) {

  const { lockScroll, unlockScroll } = useScrollLock();

  const handleClose = () => {
    unlockScroll();
    setOpenModal(false);
    handleModalClose && handleModalClose();
  }

  // Pour verrouiller le scroll en arriere plan quand la modal est ouverte
  useEffect(() => {
    if (openModal) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }, [openModal]);
  

  const submit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit();
    } else {
      handleClose();
    }
  }

  const mouseDownPosRef = useRef(null);
  const mouseMovedRef = useRef(false);
  
  const handleMouseDown = (e) => {
    // Enregistrez la position initiale du clic
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    mouseMovedRef.current = false;
  };
  
  const handleMouseMove = (e) => {
    // Si aucun clic n'a été enregistré, sortir
    if (!mouseDownPosRef.current) return;
    
    // Calculer la distance parcourue par la souris
    const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
    const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
    
    // Si la souris a bougé de plus de 5 pixels dans n'importe quelle direction,
    // considérez que c'est un mouvement de glisse
    if (dx > 5 || dy > 5) {
      mouseMovedRef.current = true;
    }
  };
  
  const handleMouseUp = (e) => {
    // Si la classe correspond et que la souris n'a pas bougé significativement
    if (
      e.target.className === 'change-category-container more-info-container change-category-active' && 
      !mouseMovedRef.current
    ) {
      handleClose();
    }
    
    // Réinitialiser les références
    mouseDownPosRef.current = null;
  };


  return (
    <>
      <div 
        className={`change-category-container more-info-container ${openModal ? 'change-category-active' : ''}`} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className={`change-category-wrapper pl-0 ${openModal ? 'change-category-active' : ''} ${wrapperClass}`}>
          <i className="bi bi-x-lg close-input-change-category" onClick={handleClose}></i>
          <h1 className={`title-filter-competition ${titleClass}`}>
            {title}{titleSuffix && <span className="fw-500 ml-8 fz-14">({titleSuffix})</span>}
          </h1>
          {body}
          {(!hideOnFocuse && !noFooter) && 
            <div className="submit-modal-container justify-content-end">
              {cancelText && <p className="fw-600 fz-16 cursor-pointer mr-32" onClick={handleClose}>{cancelText}</p>}
              {btnText2 && <button className={`btn-validation user-info cursor-pointer mr-24`} onClick={submit2}>{btnText2}</button>}
              {btnText && <button className={`btn-validation user-info cursor-pointer`} onClick={submit}>{btnText}</button>}
            </div>
          }
        </div>
      </div>
    </>
  )
}

