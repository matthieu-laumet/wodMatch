import { PulseLoader } from "react-spinners";
import { useEffect, useRef, useState } from "react";
import { useGetFunRepsQuery } from "../../slices/funRepsApiSlice";

const MAX_FUN_REPS_LENGTH = 150;

const ModalFunReps = ({ 
  openModal, selectedFunRep, setSelectedFunRep, scrollLeft, setScrollLeft, onSubmit, funRepSelected, setFunRepSelected,
  funRepsFilled, hasSubmitBtn = true,
}) => {
  
  const { data: funReps, isLoading: isLoadingFunReps, isSuccess: isSuccessFunReps } = useGetFunRepsQuery();
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (openModal && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [openModal]);

  const handleSelect = (fact) => {
    setSelectedFunRep(fact);
    setFunRepSelected(prev => {
      const description = prev.description || ''
      return { id_fun_rep: fact.id_fun_rep, description, label: fact.label }
    });
    setScrollLeft(-100);
  }

  const handleChange = () => {
    setSelectedFunRep(null);
    setScrollLeft(0);
  }


  if (isLoadingFunReps) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <>
      <div className={`fun-reps-container ${selectedFunRep ? 'suggestions' : ''}`} ref={containerRef}>
        <div className="fun-reps-suggestions" style={{ transform: `translateX(${scrollLeft}%)`}}>
          {funReps
            .filter(fact => !funRepsFilled.some(f => f.id_fun_rep === fact.id_fun_rep))
            .map(fact => {
              return (
                <div className="fun-rep-line" key={fact.id_fun_rep} onClick={() => handleSelect(fact)}>
                  <p className="text-sm font-medium">{fact.label}</p>
                </div>
              )
          })}
        </div>
        <div className="fun-reps-description" style={{ transform: `translateX(${scrollLeft + 100}%)`}}>
          <div className="flex gap-4 cursor-pointer" onClick={handleChange}>
            <i className='bi bi-chevron-left'></i>
            <p className='font-semibold underline'>{selectedFunRep?.label}</p>
          </div>
          <div className="bio-wrapper fun-rep">
            <textarea
              className="bio-textarea"
              value={funRepSelected.description}
              onChange={(e) => {
                if (e.target.value.length <= MAX_FUN_REPS_LENGTH) {
                  setFunRepSelected({ ...funRepSelected, description: e.target.value });
                }
              }}
              placeholder="Sois drôle, on ne juge pas (ou presque)."
              rows={5}
            />
            <span className="bio-counter">{MAX_FUN_REPS_LENGTH - funRepSelected.description.length}</span>
          </div>
          {hasSubmitBtn && 
            <button 
              onClick={() => onSubmit(funRepSelected)} disabled={funRepSelected.description?.length === 0}
              className="btn-submit-funrep"
            >
              Ajouter
            </button>
          }
        </div>
      </div>
    </>
  );
};

export default ModalFunReps;