import { useContext, useEffect, useState } from 'react';
import { useGetImageQuery } from '../slices/imagesApiSlice';
import dataApplicationsContext from '../context/dataApplicationsContext';
import Skeleton from 'react-loading-skeleton';
import { baseColor } from '../context/dataApplicationsContext';
import { baseColor2 } from '../context/dataApplicationsContext';

const GetAvatar = ({ filename, fullname, onClick, className, id, watch, alt, skeletonClasses }) => {
  const { auth } = useContext(dataApplicationsContext);

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

  
  
  if (isLoading) {
    return <Skeleton className={className + ' ' + skeletonClasses} baseColor={baseColor2} highlightColor={baseColor} duration='1'/>;
  }

  return (   
    <img 
      src={imageSrc} 
      alt={alt || 'avatar'} 
      id={id}
      className={className}
      onError={handleImageError}
      onClick={onClick}
    />
  );
};

export default GetAvatar;