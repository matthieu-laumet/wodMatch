import { useEffect, useState } from 'react';
import { useGetImageQuery } from '../slices/imagesApiSlice';
import Skeleton from 'react-loading-skeleton';

const GetImage = ({ src, className, id, onClick, refProp, isLocalFile = false, skeletonClasses = ''}) => {
  const isHttp = src && src.startsWith('http');
  const isBlobUrl = src && src.startsWith('blob:'); // Détecter les URLs blob
  const [leviiaImg, setLeviiaImg] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Skip la query si c'est une URL http, blob, ou un fichier local
  const { data: imageUrl, isLoading, isError, isSuccess } = useGetImageQuery(src, {
    skip: isHttp || isBlobUrl || isLocalFile || !src,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  });
  
  useEffect(() => {
    // Si c'est une URL http ou blob, l'utiliser directement
    if (isHttp || isBlobUrl) {
      setLeviiaImg(src);
    }
    // Sinon, utiliser l'image chargée par la query
    else if (imageUrl && !isError) {
      setLeviiaImg(imageUrl);
    }
    // En cas d'erreur, utiliser l'image par défaut
    else if (isError) {
      setLeviiaImg(`https://res.cloudinary.com/dkz9knsgj/image/upload/v1759215063/20162309_100925_1_vlr3yb.png`);
    }
  }, [imageUrl, isError, isSuccess, src, isHttp, isBlobUrl]);

  if (isLoading) {
    return <Skeleton className={className + ' ' + skeletonClasses} />;
  }
  
  return (   
    <img
      src={leviiaImg}
      alt=""
      className={className}
      id={id}
      onClick={onClick || undefined}
      ref={refProp || null}
    />
  );
};

export default GetImage;