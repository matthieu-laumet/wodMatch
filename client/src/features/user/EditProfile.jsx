import { useContext, useState } from "react";
import dataApplicationsContext, { MAX_BIO_LENGTH } from "../../context/dataApplicationsContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import ModalFunReps from "../home/ModalFunReps";
import ModalStructure from "../../components/ModalStructure";
import FunRepCards from "../home/FunRepCards";
import ModalSkills from "./ModalSkills";
import { toast } from 'react-toastify';
import { useCleanUpsertUserSkillsMutation } from "../../slices/skillsApiSlice";
import { useDeleteUserFunRepMutation, useUpsertUserFunRepsMutation } from "../../slices/funRepsApiSlice";
import { useUpdateUserProlfilMutation } from "../../slices/usersApiSlice";
import OnboardLevel from "../home/OnboardLevel";


const schema = yup.object().shape({
  bio: yup
    .string()
    .required('La bio est obligatoire')
    .max(MAX_BIO_LENGTH, `La bio ne peut pas dépasser ${MAX_BIO_LENGTH} caractères`),
  levels: yup
    .array()
    .min(1, 'Sélectionne au moins un niveau'),
});


export default function EditProfile() {
  const { auth, setAuth } = useContext(dataApplicationsContext);
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [openModalSkill, setOpenModalSkill] = useState(false);
  const [selectedFunRep, setSelectedFunRep] = useState(null);
  const [userLevels, setUserLevels] = useState(auth?.user?.user_levels || []);
  const [oldRepValue, setOldRepValue] = useState(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [funRepSelected, setFunRepSelected] = useState({ id_fun_rep: null, description: '', label: '' });
  const [funRepsFilled, setFunRepsFilled] = useState(auth?.user?.user_fun_reps || []);

  const [selectedSkillIds, setSelectedSkillIds] = useState(
    auth?.user?.user_skills?.map(s => s.id_skill) || []
  );

  const [cleanUpsertUserSkills] = useCleanUpsertUserSkillsMutation();
  const [upsertUserFunReps] = useUpsertUserFunRepsMutation();
  const [deleteUserFunRep] = useDeleteUserFunRepMutation();
  const [updateUserProlfil] = useUpdateUserProlfilMutation();

  const form = useForm({
  defaultValues: {
    bio: auth?.user?.bio || '',
    levels: auth?.user?.user_levels?.map(l => l.id_level) || [],
  },
  resolver: yupResolver(schema),
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const bioValue = watch("bio");

  const onSubmit = async (data) => {
    console.log(data);
    const { bio } = data;
    try {
      await updateUserProlfil({ bio });
      setAuth(prev => ({ ...prev, user: { ...prev.user, bio } }));
      navigate('/profil');
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.error || 'Erreur serveur', { autoClose: 6000 });
    }
  };

  const handleOpenSkills = () => {
    setOpenModalSkill(true);
  };

  const onCloseModal = () => {
    setSelectedFunRep(null);
    setOpenModal(false);
    setOpenModalSkill(false);
    setTimeout(() => setScrollLeft(0), 100);
  };

  const onSubmitFunRep = (funRep) => {
    if (!funRep.description?.length) return;
    const exists = funRepsFilled.find(f => f.id_fun_rep === funRep.id_fun_rep);
    setFunRepsFilled(prev =>
      exists ? prev.map(f => f.id_fun_rep === funRep.id_fun_rep ? funRep : f)
             : [...prev, funRep]
    );
    onCloseModal();
  };

  const handleAddFunRep = () => {
    setFunRepSelected({ id_fun_rep: null, description: '', label: '' });
    setOpenModal(true);
  };

  const handleDeleteFunRep = async (rep) => {
    try {
      await deleteUserFunRep({ id_fun_rep: rep.id_fun_rep })
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.error || 'Erreur serveur', { autoClose: 6000 });
    }
  };

  const handleSubmitFunReps = async () => {
    if (funRepSelected?.description?.length === 0) return
    try {
      const result = await upsertUserFunReps({ oldRepId: oldRepValue, newFunRep: funRepSelected }).unwrap();
      setFunRepsFilled(result.user_fun_reps)
      setAuth(prev => ({ ...prev, user: { ...prev.user, user_fun_reps: result.user_fun_reps } }));
      setOldRepValue(null)
      onCloseModal();
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.error || 'Erreur serveur', { autoClose: 6000 });
    }
  };

  const handleSubmitSkills = async () => {
    if (!selectedSkillIds || selectedSkillIds.length === 0) return
    const currentIds = userSkills?.map(s => s.id_skill).sort().join(',') ?? '';
    const selectedIds = selectedSkillIds.map(s => s.id_skill).sort().join(',');

    if (currentIds === selectedIds) {
      onCloseModal();
      return;
    }

    try {
      await cleanUpsertUserSkills({ skills: selectedSkillIds });
      setAuth(prev => ({ ...prev, user: { ...prev.user, user_skills: selectedSkillIds} }));
      onCloseModal();
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.error || 'Erreur serveur', { autoClose: 6000 });
    }
  };

  const userSkills = auth?.user?.user_skills;

  return (
    <div className='padding7p pb-16'>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-6">
          <h3 className="title-sticky pt-6 pb-4">
            <span className="texte">Modifier mes informations</span>
            <span className="submit" onClick={handleSubmit(onSubmit)}>Terminé</span>
          </h3>
          <p className="mt-[64px]">Les podiums se construisent à plusieurs. Complète ton profil et trouve les partenaires qui vont te faire monter de niveau. 🥇</p>
        </div>
        <div className="bio-field mt-4">
          <label className="font-semibold text-lg">Ma bio d'athlète :</label>
          <div className="bio-wrapper small mt-2">
            <textarea
              className={`bio-textarea ${errors.bio ? 'border-red-500' : ''}`}
              {...register("bio")}
              placeholder="Parle nous de toi ! Avec moi c'est un podium assuré..."
              rows={4}
            />
            <span className="bio-counter">{MAX_BIO_LENGTH - (bioValue?.length || 0)}</span>
          </div>
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        {/* Fun reps */}
        <div className="mt-12 mb-3">
          <h2 className="font-semibold text-lg mb-2">Fun Reps</h2>
          {funRepsFilled.length === 0 && <p className="font-medium">Fais la différence avec une anecdote</p>}
          {funRepsFilled.length > 0 &&
            <FunRepCards
              funRepsFilled={funRepsFilled} setFunRepsFilled={setFunRepsFilled}
              setOpenModal={setOpenModal} setSelectedFunRep={setSelectedFunRep} 
              oldRepValue={oldRepValue} setOldRepValue={setOldRepValue} onDelete={handleDeleteFunRep}
              setScrollLeft={setScrollLeft} funRepSelected={funRepSelected} setFunRepSelected={setFunRepSelected}
            />
          }
          <button type="button" className="fun-rep-btn mt-4" onClick={handleAddFunRep}>
            <p className="font-semibold">Ajouter une fun rep sur moi</p>
            <p>soi drôle c'est ton moment</p>
            <FontAwesomeIcon icon={faCirclePlus} className="fun-icon-plus"/>
          </button>
        </div>
        <div className="mt-12 mb-3">
          <h2 className="font-semibold text-lg mb-2">Tes Skills</h2>
          <div className="relative">
            <div className="onboard-skill__tags start pr-4">
              {userSkills?.map(skill => {
                return(
                  <p className="onboard-skill__tag" key={skill.id_skill} onClick={handleOpenSkills}>{skill.label}</p>
                )
              })}
            </div>
            <FontAwesomeIcon icon={faCirclePlus} className="skill-icon-add" onClick={handleOpenSkills}/>
          </div>
        </div>
        <div className="mt-12 mb-3">
          <h2 className="font-semibold text-lg mb-2">Niveau de Fitness</h2>
          <OnboardLevel
            userLevels={userLevels}
          />
        </div>

        {/* <button type="submit" className="btn-primary mt-6 w-full">Enregistrer</button> */}
      </form>
      <ModalStructure
        openModal={openModal} setOpenModal={onCloseModal} title='Ajouter une Fun rep'
        body={<ModalFunReps
          openModal={openModal} selectedFunRep={selectedFunRep} setSelectedFunRep={setSelectedFunRep}
          scrollLeft={scrollLeft} setScrollLeft={setScrollLeft} onSubmit={onSubmitFunRep}
          funRepSelected={funRepSelected} setFunRepSelected={setFunRepSelected} funRepsFilled={funRepsFilled}
          hasSubmitBtn={false} oldRepValue={oldRepValue} setOldRepValue={setOldRepValue}
        />}
        onSubmit={handleSubmitFunReps} isDisabled={funRepSelected?.description?.length === 0}
        noFooter closeSubmit closeLeft
      />
      <ModalStructure
        openModal={openModalSkill} setOpenModal={onCloseModal} title='Modifier mes skills'
        body={<ModalSkills userSkills={userSkills} onSelectionChange={setSelectedSkillIds} />} 
        onSubmit={handleSubmitSkills} isDisabled={selectedSkillIds?.length === 0} noFooter closeSubmit
      />
    </div>
  );
}