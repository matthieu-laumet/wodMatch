import { useContext } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { useHandleHideUserProfilMutation } from "../../slices/usersApiSlice";

export default function Competitions({ }) {
  const { auth, setAuth } = useContext(dataApplicationsContext);

  const [handleHideUserProfil] = useHandleHideUserProfilMutation();

  const displayProfile = async () => {
    try {
      await handleHideUserProfil({ is_hidden: false });
      setAuth(prev => ({ ...prev, user: { ...prev.user, is_hidden: false } }));
    } catch (error) {
      console.log(error)
    }
  }

  if (auth.user.is_hidden) {
    return (
      <div className="full-screen pl-12 pr-12 pt-24 flex flex-col">
        <h3 className="text-2xl font-semibold">Ton profil est maqué</h3>
        <p className="mt-6 mb-6">
          Les WODs ne se font pas solo. Réaffiche ton profil pour retrouver ta prochaine équipe. 
          Les Burppes, c'est quand même plus sympa à plusieurs
        </p>
          <button className="btn black px-12 py-4" onClick={displayProfile}>
            Afficher mon profil
          </button>
      </div>
    )
  }

  return (
    <div className='full-screen'>
      <p>Competitions</p>
    </div>
  )
}