import { useContext, useEffect, useState } from "react";
import dataApplicationsContext, { titleApp } from "../../context/dataApplicationsContext";
import { useGetUserTempImagesQuery } from "../../slices/imagesApiSlice";
import { PulseLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

export default function Profil({ }) {
  const { auth } = useContext(dataApplicationsContext);
  const { data: remotePhotos = [], isLoading: isLoadingTempImages, isSuccess: isSuccessTempImages } = useGetUserTempImagesQuery();

  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (remotePhotos.length === 0) return;
    setPhotos(remotePhotos.map(photo => ({
      id: crypto.randomUUID(), filename: photo.filename, url: photo.url, // ✅ base64 direct, pas besoin d'un 2ème appel
    })));
  }, [remotePhotos]);

  const mainPhoto = isLoadingTempImages
    ? <PulseLoader color='#505050' size={8} className="pl-14 pt-16 main-avatar"/>
    : <img src={photos[0]?.url} className='main-avatar'/>

  const tauxCompletion = auth?.user?.taux_completion || 65;

  return (
    <div className='full-screen'>
      <div className="section profil-top-container">
        <div className="main-photo-container">
          {mainPhoto}
          <p className="flap-completion">Complété à {tauxCompletion}%</p>
        </div>
        <div className="second-menus-container">
          <div className="bloc small" onClick={() => navigate('settings')}>
            <i className="bloc-icon bi bi-gear-fill text-3xl"></i>
            <p className="bloc-label">Réglages</p>
          </div>
          <div className="bloc lg" onClick={() => navigate('edit')}>
            <i className="bloc-icon bi bi-pencil-fill text-4xl"></i>
            <p className="bloc-label">Modifier mon profil</p>
          </div>
          <div className="bloc small black" onClick={() => navigate('edit-pictures')}>
            <i className="bloc-icon bi bi-camera-fill text-3xl"></i>
            <span className="additionnal">
              <i className="bi bi-plus-circle"></i>
            </span>
            <p className="bloc-label">Gérer mes photos</p>
          </div>
        </div>
        <div className="profil-completion" style={{ width: `${tauxCompletion}%`}}></div>
      </div>
      <div className="section profil-bottom-container">
        <img src="/images/bg_profil.jpg" className='img-fond'/>
        <div className="text-container">
          <h3 className="text-4xl font-black uppercase">{titleApp}</h3>
          <p className="text-md font-medium">
            Le 1er réseau pour connecter les athlètes et former des teams prêtes à performer en compétition.
          </p>
        </div>
      </div>
    </div>
  )
}