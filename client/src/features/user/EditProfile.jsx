import { useContext, useEffect, useState } from "react";
import dataApplicationsContext, { titleApp } from "../../context/dataApplicationsContext";
import { useGetUserTempImagesQuery } from "../../slices/imagesApiSlice";
import { PulseLoader } from "react-spinners";

export default function EditProfile({ }) {
  const { auth } = useContext(dataApplicationsContext);
  const { data: remotePhotos = [], isLoading: isLoadingTempImages, isSuccess: isSuccessTempImages } = useGetUserTempImagesQuery();

  const [photos, setPhotos] = useState([]);

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
      <p>Edit profil</p>
    </div>
  )
}