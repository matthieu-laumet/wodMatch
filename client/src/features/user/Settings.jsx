import { useContext, useState } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import EditableLine from "../../components/EditableLine";
import { useHandleHideUserProfilMutation, useUpdateUserEmailMutation, useUpdateUserTelephoneMutation } from "../../slices/usersApiSlice";
import Swal from 'sweetalert2';
import { alerteDeleteAccount, alerteDeleteAccountConfirm, alerteWarningSimple } from "../../components/Alert";
import { useSendLogoutMutation } from "../auth/authApiSlice";


const schema = yup.object().shape({
  // bio: yup
  //   .string()
  //   .required('La bio est obligatoire')
  //   .max(MAX_BIO_LENGTH, `La bio ne peut pas dépasser ${MAX_BIO_LENGTH} caractères`),
});


export default function Settings({ }) {
  const { auth, setAuth } = useContext(dataApplicationsContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('');
  const [updateUserEmail] = useUpdateUserEmailMutation();
  const [updateUserTelephone] = useUpdateUserTelephoneMutation();
  const [sendLogout] = useSendLogoutMutation();
  const [handleHideUserProfil] = useHandleHideUserProfilMutation();

  const form = useForm({
    defaultValues: {
    },
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const onSubmit = async (data) => {
    console.log(data);
    try {
      navigate('/profil');
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.error || 'Erreur serveur', { autoClose: 6000 });
    }
  };

  const handleActive = (section) => {
    setActiveSection(prev => prev === section ? '' : section);
  };

  const handleSaveEmail = async (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      toast.error('Adresse e-mail invalide');
      throw new Error('invalid'); // ← signale l'échec à handleSave
    }
    const email = val.toLowerCase().trim();
    await Swal.fire(
      alerteWarningSimple({
        warningText: `
          <p>Cette modification mettra à jour votre email sur <strong>WodMatch™</strong> et <strong>WodZone®</strong>.</p>
          <p style="margin-top:12px;">
            Votre nouvelle adresse email servira désormais à vous connecter aux deux applications.
          </p>
        `
      })
    );
    try {
      const updateResult = await updateUserEmail({ email }).unwrap();
      setAuth(prev => ({ ...prev, user: { ...prev.user, email } }));
      (updateResult?.message !== 'no update') && toast.success('L\'e-mail a bien été mis à jour');
    } catch (error) {
      console.log(error)
      if (error?.status === 409) {
        toast.error('Cet e-mail est déjà utilisé');
      } else {
        toast.error('Une erreur est survenue');
      }
      throw new Error('update failed'); // ← pour que EditableLine reste ouvert
    }
  };


  const handleSaveTelephone = async (telephone) => {
    try {
      const digits = telephone.replace(/[\s\-().+]/g, '');
      const phoneRegex = /^(0033|33)?[67]\d{8}$/;

      if (!phoneRegex.test(digits)) {
        toast.error('Numéro de téléphone invalide');
        throw new Error('invalid');
      }

      if (!phoneRegex.test(digits)) {
        toast.error('Numéro de téléphone invalide');
        throw new Error('invalid');
      }

      const updateResult = await updateUserTelephone({ telephone }).unwrap();
      setAuth(prev => ({ ...prev, user: { ...prev.user, telephone } }));
      (updateResult?.message !== 'no update') && toast.success('Le numéro de téléphone a bien été mis à jour');
    } catch (error) {
      if (error?.status === 409) {
        toast.error('Ce numéro de téléphone est déjà utilisé');
      } else if (error?.message !== 'invalid') {
        toast.error('Une erreur est survenue');
      }
      throw new Error('update failed');
    }
  };

  const handleLogout = async () => {
    await sendLogout();
    window.scrollTo({ top: 0, left: 0 })
    setAuth([]);
    navigate('/');
  }

  const handleDeleteAccount = async () => {
    if (auth.user.is_hidden) {
      // Profil déjà masqué → on saute directement à la confirmation de suppression
      const result = await alerteDeleteAccountConfirm()
      if (result?.action === 'delete') {
        // appel API supprimer compte + délai de grâce
      }
      return
    }
    // const { hasUpcomingCompetition, competitionDate } = await checkUserCompetitions(userId)
    let hasUpcomingCompetition, competitionDate
    if (hasUpcomingCompetition) {
      // modale bloquante, pas de suppression possible
      Swal.fire({
        title: 'Suppression impossible',
        html: `Tu es engagé dans une compétition le <strong>${competitionDate}</strong>. 
              Tu pourras supprimer ton compte après cette date.`,
        confirmButtonText: 'Compris',
        // pas de cancelButton, une seule issue
      })
      return
    }

    const result = await alerteDeleteAccount({ isInTeam: false })
    if (result?.action === 'hide') {
      await handleHideUserProfil({ is_hidden: true });
      setAuth(prev => ({ ...prev, user: { ...prev.user, is_hidden: true } }));
      navigate('/competitions')
      window.scroll(0,0)
    } else if (result?.action === 'delete') {
      // appel API supprimer compte + délai de grâce
    }
  }

  const handleBlockAthlete = async (e) => {
    e.stopPropagation();
    navigate('block-athletes')
    window.scroll(0,0)
  };

  const handleNavigate = async (e, link) => {
    e.stopPropagation();
    window.open(link, '_blank');
  };

  return (
    <div className='padding7p pb-4'>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-6">
          <h3 className="title-sticky pt-6 pb-4">
            <span className="texte">Réglages</span>
            <span className="submit" onClick={handleSubmit(onSubmit)}>Terminé</span>
          </h3>
        </div>
        <div className="mt-[64px] mb-3">
          <h2 className="font-semibold text-lg mb-2">Gestion du compte</h2>
          <p className="">
            Pour plus de simplicité, votre compte{" "}
            <strong className="font-semibold">WodMatch™</strong>{" "}et{" "}
            <strong className="font-semibold">WodZone®</strong>{" "}sont synchronisés comme un WOD team.
          </p>
          <EditableLine
            label="Adresse e-mail" value={auth?.user?.email} type="email" className="mt-6" 
            isActive={activeSection === 'email'} inputMode="email"
            onSave={handleSaveEmail} onToggle={() => handleActive('email')}
          />
          <EditableLine
            label="Num de Téléphone" value={auth?.user?.telephone} type="telephone" className="mt-[-1px]"  
            isActive={activeSection === 'telephone'} inputMode="tel"
            onSave={handleSaveTelephone} onToggle={() => handleActive('telephone')}
          />
          <p className="text-md font-regular mt-3 opacity-70">
            Un numéro de téléphone et une adresse e-mail vérifiés permettent de sécuriser votre compte.
          </p>
          <EditableLine
            label="Bloquer des Athlètes" value={null} type="BlockedAthletes" className="mt-[24px]"  
            onClick={handleBlockAthlete}
          />
          <p className="text-md font-regular mt-3 opacity-70">
            On ne choisit pas ses partenaires de box, mais sur WodMatch si. Ajoute les emails des profils que tu veux éviter — promis, ils ne sauront jamais.
          </p>


          <EditableLine
            label="Centre d'aides" value={null} className="mt-[24px]"  onClick={(e) => handleNavigate(e, 'https://help.wodzone.fr')}
          />
          <EditableLine
            label="Règle et Communauté" value={null} className="mt-[-1px]"  onClick={(e) => handleNavigate(e, 'https://help.wodzone.fr')}
          />
          <EditableLine
            label="Politique relative au cookies" value={null} className="mt-[-1px]"  onClick={(e) => handleNavigate(e, 'https://help.wodzone.fr')}
          />
          <EditableLine
            label="Politique de confidentialité" value={null} className="mt-[-1px]"  onClick={(e) => handleNavigate(e, 'https://help.wodzone.fr/topics/about/62')}
          />
          <EditableLine
            label="Condition d'utilisation" value={null} className="mt-[-1px]"  onClick={(e) => handleNavigate(e, 'https://help.wodzone.fr')}
          />

          <div className="full-line block mt-12" onClick={handleLogout}>
            <p className="label text-center text-md font-medium">Se déconnecter</p>
          </div>
          <div className="version-container flex flex-col items-center mt-6 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 512 512" style={{ filter: "brightness(0) invert(0) opacity(0.75)", transform: "rotate(-16deg)" }}>
              <image href="data:image/png;base64,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" x="0" y="0" width="512" height="512"/>
            </svg>
            <p>Version {process.env.REACT_APP_VERSION}</p>
          </div>
          <div className="full-line block mt-8" onClick={handleDeleteAccount}>
            <p className="label text-center text-md font-medium">Supprimer mon compte WodMAtch</p>
          </div>
        </div>
      </form>
    </div>
  )
}