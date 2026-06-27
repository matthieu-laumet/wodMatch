import { useNavigate } from "react-router-dom";
import { useGetUserBoxVisibilitiesQuery, useUpdateUserClubVisibilitiesMutation, useUpsertUserVisibilityMutation } from "../../slices/usersApiSlice";
import { useForm } from 'react-hook-form';
import { PulseLoader } from "react-spinners";
import { useContext, useEffect, useState } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import PersonalInfoLine from "./PersonalInfoLine";
import AdminSelect from "../../components/AdminSelect";
import { useGetAllClubsQuery } from "../../slices/clubsApiSlice";
import Select from 'react-select';
import { Option, MenuList, SingleValue } from '../../components/selectAthletesConfig';


const options = [
  { "label": "Jayson HOPPER", "value": 57, "id": 57,
    "avatar": "https://profilepicsbucket.crossfit.com/da4cc-P1020449_8-184.jpg",
    "club": "CrossFit Crash", "first_name": "Jayson", "last_name": "HOPPER"
  },
  { "label": "Justin MEDEIROS", "value": 58, "id": 58,
    "avatar": "https://api.dicebear.com/7.x/thumbs/svg?seed=JustinMEDEIROS",
    "club": "CrossFit Fort Vancouver", "first_name": "Justin", "last_name": "MEDEIROS"
  },
  { "label": "Tia-Clair TOOMEY", "value": 59, "id": 59,
    "avatar": "https://profilepicsbucket.crossfit.com/f1d92-P163097_5-184.jpg",
    "club": "CrossFit PRVN", "first_name": "Tia-Clair", "last_name": "TOOMEY"
  },
]


export default function Visibility() {
  const { data: userBoxVisibilities, isLoading: isLoadingUserBoxVisibilities, isSuccess: isSuccessUserBoxVisibilities, } = useGetUserBoxVisibilitiesQuery({undefined }, 
    { refetchOnFocus: true, refetchOnMountOrArgChange: true });
  const { data: clubs, isLoading: isLoadingClubs, isSuccess: isSuccessClubs } = useGetAllClubsQuery();

  const { auth, setAuth } = useContext(dataApplicationsContext);
  const currentUser = auth.user;
  const [upsertUserVisibility] = useUpsertUserVisibilityMutation();
  const [updateUserClubVisibilities] = useUpdateUserClubVisibilitiesMutation();

  const boxSelectedNames = isSuccessUserBoxVisibilities 
    ? userBoxVisibilities.map(box => box.label).join(', ')
    : <PulseLoader color='#22222270' size={6}/>;

  let clubsOptions = [];
  (clubs && isSuccessClubs) && clubs.filter(clu => clu.id_club > 0)?.forEach(club => {
    // Vérifiez si le label existe déjà dans clubsOptions
    const labelExists = clubsOptions.some(option => option.label === club.name);
    
    // Si le label n'existe pas, ajoutez l'option
    if (!labelExists) {
      clubsOptions.push({ label: club.name, value: club.id_club })
    }
  });

  const navigate = useNavigate();

  const handlePrev = () => {
    window.scroll(0, 0);
    navigate('/profil/settings')
  };

  const form = useForm();
  const { register, control, watch, setValue, handleSubmit, formState, reset, setFocus } = form;
  const { errors } = formState;

  useEffect(() => {
    if (isSuccessClubs && isSuccessUserBoxVisibilities) {
      reset({
        visibility_yes: !currentUser.is_not_visible || false,
        visibility_no: currentUser.is_not_visible || false,
        all_box: userBoxVisibilities.length === 0,
        box_choice: userBoxVisibilities.length > 0,
        select_box: userBoxVisibilities
      });
    }
  }, [isSuccessClubs, isSuccessUserBoxVisibilities, reset, userBoxVisibilities]);

  const updateVisibilityFonction = async (data) => {
    const { visibility_no } = data;
    try {
      const response = await upsertUserVisibility({ is_not_visible: visibility_no }).unwrap();
      setAuth(prevState => ({ ...prevState, user: { ...prevState.user, is_not_visible: visibility_no }, }));
      return {...response }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      throw error; // Propagez l'erreur pour la gérer à un niveau supérieur si nécessaire
    }
  }

  const handleUserBoxVisibilities = async (data) => {
    // console.log(data)
    const { select_box, box_choice } = data;
    try {
      const response = await updateUserClubVisibilities({ select_box, box_choice });
      setAuth(prevState => ({ ...prevState, user: { ...prevState.user }, }));
      return {...response }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      throw error; // Propagez l'erreur pour la gérer à un niveau supérieur si nécessaire
    }
  }

  return (
    <div className='full-screen padding pt-6'>
      <i className="bi bi-arrow-left-circle text-3xl cursor-pointer" onClick={handlePrev}></i>
      <div className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Gérer ma visibilité</h2>
        <p>
          Choisis qui peut te voir dans la liste des athletes — tout le monde, personne, ou uniquement les membres de tes box.
          Valable aussi pour WodZone®
        </p>
      </div>

      <div className="contact-container mt-8">
        <form noValidate className="mt-0 border-top">
          <PersonalInfoLine
            name={'visibility_general'} type='checkbox' label="Visibilité de mon profil" 
            value={watch('visibility_yes') ? 'Oui, j\'accepte' : 'Non, je refuse'} reset={reset}
            explication="Indiquez si vous souhaitez être visible dans la liste des athlètes. Exemple ci-dessous." 
            control={control} noLabel={true} slug='news' watchH={true} // Pour decocher l'autre valeur
            editInputs={[
              {label: 'Oui', value: watch('visibility_yes'), name: 'visibility_yes'}, 
              {label: 'Non', value: watch('visibility_no'), name: 'visibility_no'}, 
            ]} 
            register={register} errors={errors} setValue={setValue} handleSubmit={handleSubmit}
            updateFonction={updateVisibilityFonction}
          />
          {watch('visibility_yes') && 
            <div className="mt-8">
              <PersonalInfoLine 
                name={'visibility_box'} type='checkbox' label="Qui peut voir mon profil" 
                value={watch('all_box') ? 'Tout le monde' : boxSelectedNames} reset={reset}
                explication="Votre profil sera visible uniquement par les athlètes des box que vous sélectionnez ou par tout le mode." 
                control={control} noLabel={true} watchH={true} // Pour decocher l'autre valeur
                editInputs={[
                  {label: 'Tout le monde', value: watch('all_box'), name: 'all_box'}, 
                  {label: 'Quelques box', value: watch('box_choice'), name: 'box_choice'}, 
                ]} 
                register={register} errors={errors} setValue={setValue} handleSubmit={handleSubmit}
                updateFonction={handleUserBoxVisibilities} update={updateUserClubVisibilities}
                body={watch('box_choice') 
                  ? <AdminSelect
                      control={control} options={clubsOptions} name={'select_box'} isMulti={true}
                      classContainer={`score-select-admin-container user-box mb-8`} classLabel="font-semibold mb-2" 
                      classSelect='input-select-container' classNamePrefix="input-select"
                      placeholder={'Tapez le nom de la box'} label={'label'} onlyOpenInSearch={true}
                    />
                  : <></>
                }

              />
            </div>
          }
        </form>
        <div className="mt-8 flap-mobile-visibilty">
          <h4 className="font-semibold text-md mb-2">Athlète</h4>
          <Select 
            options={options}
            components={{ Option, MenuList, SingleValue }}
            maxOptions={100} readOnly menuIsOpen={true} value={null} 
            className={`input-select-container select-athlete-container user-visibility`} 
            classNamePrefix="input-select" isSearchable={false} isClearable={false} 
            placeholder={"Taper le nom d'un athlète"}
          />
        </div>
      </div>
    </div>
  );
}