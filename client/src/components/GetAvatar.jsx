import { useContext, useEffect, useState } from 'react';
import { useGetImageQuery } from '../slices/imagesApiSlice';
import dataApplicationsContext from '../context/dataApplicationsContext';
import Skeleton from 'react-loading-skeleton';
import { baseColor } from '../context/dataApplicationsContext';
import { baseColor2 } from '../context/dataApplicationsContext';

const GetAvatar = ({ filename, fullname, onClick, className, id, watch, alt, skeletonClasses }) => {
  const { auth, isAuthLoading } = useContext(dataApplicationsContext);

  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(`https://api.dicebear.com/7.x/thumbs/svg?seed=${fullname}`);
  const shouldFetch = filename && !filename.startsWith('http');
  
  const { data: imageUrl, isLoading, isError, isSuccess, refetch } = useGetImageQuery(filename, {
    skip: !shouldFetch, refetchOnFocus: true, refetchOnMountOrArgChange: true
  });
  
  // Mettre à jour l'image quand elle est chargée
  useEffect(() => {
    if (imageUrl && !imageError) {
      setImageSrc(imageUrl);
    } else if (isError) {
      setImageSrc(`https://api.dicebear.com/7.x/thumbs/svg?seed=${fullname}`);
    } else if (filename && filename.startsWith('http')) {
      setImageSrc(filename);
    } else if (!filename) {
      setImageSrc(`https://api.dicebear.com/7.x/thumbs/svg?seed=${fullname}`);
    }
  }, [imageUrl, isError, imageError, filename, fullname, isSuccess, auth, watch]);

  
  const handleImageError = ({ currentTarget }) => {
    currentTarget.onerror = null;
    setImageError(true);
    const fallbackSrc = `https://api.dicebear.com/7.x/thumbs/svg?seed=${fullname}`;
    setImageSrc(fallbackSrc);
    currentTarget.src = fallbackSrc;
  };

  
  
  if (isLoading || isAuthLoading) {
    return (
      <div
        className={className + ' ' + skeletonClasses + ' avatar'}
        style={{ borderRadius: '50%', background: 'linear-gradient(90deg, #D3D3D3 25%, #ebebeb 50%, #D3D3D3 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1s infinite' }}
      />
    );
  }

  return (   
    auth?.user?.email 
      ? <img 
          src={imageSrc} 
          alt={alt || 'avatar'} 
          id={id}
          className={className + ' avatar'}
          onError={handleImageError}
          onClick={onClick}
        />
      : <i className="bi bi-person nav-people-icon"></i>
  );
};

export default GetAvatar;