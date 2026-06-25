import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from 'react-toastify';
import InputText from "../../components/InputText";
import { useAddBlockedUserMutation, useGetVisiblesAthleteListsQuery } from "../../slices/usersApiSlice";
import { optionsUsersFonction, customFilter } from "../../components/selectAthletesConfig"
import SelectAthlete from "../../components/SelectAthlete";


const schema = yup.object().shape({
  athlete: yup.mixed().nullable(),
  contact_fullname: yup.string().when('athlete', {
    is: (athlete) => !athlete,
    then: (schema) => schema.required('Veuillez renseigner un nom'),
    otherwise: (schema) => schema.notRequired(),
  }),
  blocked_email: yup.string().when('athlete', {
    is: (athlete) => !athlete,
    then: (schema) => schema.email('Adresse e-mail invalide').required('Veuillez renseigner une adresse e-mail'),
    otherwise: (schema) => schema.notRequired(),
  }),
});


export default function AddBlockAthlete() {
  const navigate = useNavigate();

  const { data: athletes, isLoading, isError, isSuccess } = useGetVisiblesAthleteListsQuery();
  const [addBlockedUser] = useAddBlockedUserMutation();

  const userOptions = isSuccess ? optionsUsersFonction(athletes) : [];

  const handlePrev = () => {
    window.scroll(0, 0);
    navigate('/profil/settings/block-athletes')
  };

  const form = useForm({
    defaultValues: {
    },
    resolver: yupResolver(schema),
  });
  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const athlete = watch("athlete");
  const contact_fullname = watch("contact_fullname");
  const blocked_email = watch("blocked_email");

  // Activé si un athlète est sélectionné OU si les deux champs manuels sont remplis
  const isFormValid = !!athlete || !!(contact_fullname && blocked_email);

  const onSubmit = async (data) => {
    const { blocked_email, contact_fullname, athlete } = data;
    try {
      await addBlockedUser({ blocked_email, contact_fullname, id_user_blocked: athlete?.id_user ?? null });
      handlePrev();
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.error || 'Erreur serveur', { autoClose: 6000 });
    }
  };

  return (
    <div className='full-screen padding pt-6'>
      <form className="contact-container" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-between">
          <i className="bi bi-arrow-left-circle text-3xl cursor-pointer" onClick={handlePrev}></i>
          <span 
            className={`submit-form ${isFormValid ? 'valide' : 'disabled'}`}
            onClick={handleSubmit(onSubmit)}
          >
            Terminé
          </span>
        </div>
        <div className="mt-2 mb-6">
          <h2 className="text-2xl font-semibold mb-2">Ajouter un Athlète</h2>
          <div className="inputs-container flex flex-col gap-8 mt-8">
            <SelectAthlete
              name="athlete" control={control}  errors={errors}  options={userOptions}
              placeholder="Taper le nom d'un athlète" customFilter={customFilter} watch={watch}
            />
            {!athlete && (
              <>
                <div className="w-full flex items-center gap-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <p className="mb-0 font-semibold text-sm opacity-70">OU</p>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                <InputText
                  label="Nom" name="contact_fullname" register={register} errors={errors}
                  type="text" placeholder="ex: Mathew FRASER"
                />
                <InputText
                  label="Email de l'athlète" name="blocked_email" register={register} errors={errors}
                  type="email" inputMode="blocked_email" placeholder="exemple@gmail.com"
                />
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}