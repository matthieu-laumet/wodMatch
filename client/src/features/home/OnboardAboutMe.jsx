import { PulseLoader } from "react-spinners";
import { useGetStrengthsQuery } from "../../slices/strengthsApiSlice";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import ModalStructure from "../../components/ModalStructure";
import { useGetFunRepsQuery } from "../../slices/funRepsApiSlice";
import ModalFunReps from "./ModalFunReps";

const MAX_BIO_LENGTH = 500;

const OnboardAboutMe = ({ setBtnText, setIsDisabled }) => {

  const [openModal, setOpenModal] = useState(false);
  const [bio, setBio] = useState(() => {
    return sessionStorage.getItem("onboardBio") || "";
  });

  const sentinelRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem("onboardStrengths");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    setBtnText("Suivant");
    setIsDisabled(bio.trim().length === 0);
    sessionStorage.setItem("onboardBio", bio);
  }, [bio]);
  
  const onSubmit = () => {
    console.log('ici')
  }

  return (
    <>
      <div className="onboard-strength mb-12">
        <div className="mt-2 mb-4">
          <div className="flex gap-6 mb-2 items-center">
            <h2 className="text-2xl font-semibold mb-0">À propos de moi</h2>
            <span className="btn-important">Important</span>
          </div>
          <p className="font-medium">
            Montre ta grinta 💪 Explique aux teams pourquoi tu mérites une place parmi eux. C'est ton moment&nbsp;!
          </p>
        </div>
        <div className="bio-field mt-4">
          <label className="bio-label">Bio :</label>
          <div className="bio-wrapper">
            <textarea
              className="bio-textarea"
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= MAX_BIO_LENGTH) {
                  setBio(e.target.value);
                }
              }}
              placeholder="Parle nous de toi ! Avec moi c'est un podium assuré..."
              rows={5}
            />
            <span className="bio-counter">{MAX_BIO_LENGTH - bio.length}</span>
          </div>
        </div>
        <div className="mt-12 mb-4">
          <div className="flex gap-6 mb-2 items-center">
            <h2 className="text-2xl font-semibold mb-0">Fun rep</h2>
          </div>
          <p className="font-medium">Fais la différence avec une anecdote</p>
          <button className="fun-rep-btn mt-4" onClick={() => setOpenModal(true)}>
            <p className="font-semibold">Ajouter une fun rep sur moi</p>
            <p className="">soi drôle c'est ton moment</p>
            <FontAwesomeIcon icon={faCirclePlus} className="fun-icon-plus"/>
          </button>
        </div>
      </div>
        <ModalStructure
          openModal={openModal} setOpenModal={setOpenModal} title='Ajouter une Fun rep' body={<ModalFunReps />} 
          btnText='OK' onSubmit={onSubmit} noFooter={true}
        />
    </>
  );
};

export default OnboardAboutMe;