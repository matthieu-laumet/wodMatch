import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import ModalStructure from "../../components/ModalStructure";
import ModalFunReps from "./ModalFunReps";
import OnboardingSubmit from "../../components/OnboardingSubmit";

const MAX_BIO_LENGTH = 500;

const OnboardAboutMe = ({ setIsDisabled, isDisabled, setSection }) => {

  const [openModal, setOpenModal] = useState(false);
  const [selectedFunRep, setSelectedFunRep] = useState(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [bio, setBio] = useState(() => {
    return sessionStorage.getItem("onboardBio") || "";
  });

  useEffect(() => {
    setIsDisabled(bio.trim().length === 0);
    sessionStorage.setItem("onboardBio", bio);
  }, [bio]);
  
  const onCloseModal = () => {
    setSelectedFunRep(null)
    setOpenModal(false)
    setScrollLeft(0)
  }

  const onSubmit = (funRep) => {
    const saved = sessionStorage.getItem("onboardFunReps");
    const prev = saved ? JSON.parse(saved) : [];
    const exists = prev.find(f => f.id_fun_rep === funRep.id_fun_rep);
    const next = exists
      ? prev.map(f => f.id_fun_rep === funRep.id_fun_rep ? funRep : f)
      : [...prev, funRep];
    sessionStorage.setItem("onboardFunReps", JSON.stringify(next));
    onCloseModal();
  }

  const funRepsFilles = JSON.parse(sessionStorage.getItem('onboardFunRep'));

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
          {funRepsFilles?.length > 0 &&
            <></>
          }     
          <button className="fun-rep-btn mt-4" onClick={() => setOpenModal(true)}>
            <p className="font-semibold">Ajouter une fun rep sur moi</p>
            <p className="">soi drôle c'est ton moment</p>
            <FontAwesomeIcon icon={faCirclePlus} className="fun-icon-plus"/>
          </button>     
        </div>
      </div>
        <ModalStructure
          openModal={openModal} setOpenModal={onCloseModal} title='Ajouter une Fun rep' 
          body={<ModalFunReps 
            openModal={openModal} selectedFunRep={selectedFunRep} setSelectedFunRep={setSelectedFunRep}
            scrollLeft={scrollLeft} setScrollLeft={setScrollLeft} onSubmit={onSubmit}
          />} 
          btnText='OK' noFooter={true}
        />
        <OnboardingSubmit
          isDisabled={isDisabled} btnText={`Suivant`} setSection={setSection}
        />
    </>
  );
};

export default OnboardAboutMe;