import { PulseLoader } from "react-spinners";
import { useGetStrengthsQuery } from "../../slices/strengthsApiSlice";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import ModalStructure from "../../components/ModalStructure";
import { useGetFunRepsQuery } from "../../slices/funRepsApiSlice";

const ModalFunReps = ({ setBtnText, setIsDisabled }) => {
  const { data: funReps, isLoading: isLoadingFunReps, isSuccess: isSuccessFunReps } = useGetFunRepsQuery();
  const [selectedFunRep, setSelectedFunRep] = useState(null)

  if (isLoadingFunReps) return <PulseLoader color='#222' size={10} className="mt-12 ml-12"/> 

  return (
    <>
      <div className="fun-reps-container">
        {!selectedFunRep && funReps.map(fact => {
          return (
            <div className="fun-rep-line" key={fact.id_fun_rep}>
              <p className="text-sm font-medium">{fact.label}</p>
            </div>
          )
        })}
      </div>
    </>
  );
};

export default ModalFunReps;