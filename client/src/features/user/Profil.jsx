import { useContext } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";

export default function Profil({ }) {
  const { auth } = useContext(dataApplicationsContext);

  return (
    <div className='full-screen'>
      <div className="section profil-top-container">
        <div className="profil-completion" style={{ width: `${auth?.user?.taux_completion || 65}%`}}></div>
      </div>
      <div className="section profil-bottom-container">
        <img src="/images/bg_profil.jpg" className='img-fond'/>
      </div>
    </div>
  )
}