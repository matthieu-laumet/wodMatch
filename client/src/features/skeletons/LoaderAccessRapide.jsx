import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import dataApplicationsContext, { baseColor } from '../../context/dataApplicationsContext';
import { baseColor2 } from '../../context/dataApplicationsContext';
import { useContext } from 'react';

export default function LoaderAccessRapide({  }) {
  const {windowWidth} = useContext(dataApplicationsContext);

  const largeDevice = windowWidth >= 900;

  return (
    <>
      <div className="user-setting-container help">
        <div className="navigation-helper gap-16 d-flex">
          {largeDevice && <Skeleton className="h-12 w-170" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>}
          <Skeleton className="h-12 w-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
          <Skeleton className="h-12 w-125" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
          {largeDevice && <Skeleton className="h-12 w-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>}
          {largeDevice && <Skeleton className="h-12 w-150" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>}
        </div>
        <Skeleton className="h-12 w-104 mt-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
        <Skeleton className="h-30 w-330" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
        <div className="help-content-container mt-48">
          <div className="help-content-flex mb-80">
            <div className="help-left-part overflow-hidden">
              <Skeleton className="h-350 mb-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              <Skeleton className="h-16 w-450" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              <div className="article-container mt-48 border-bottom pb-8">
                <Skeleton className="w-350 h-24 mb-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 w-170 mb-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              </div>
              <div className="article-container mt-40 border-bottom pb-24">
                <Skeleton className="w-104 h-12 mb-12" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-20 w-230 mb-8" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 w-450 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              </div>
              <div className="article-container mt-40 border-bottom pb-24">
                <Skeleton className="w-104 h-12 mb-12" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-20 w-300 mb-8" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              </div>
            </div>
            {windowWidth >= 1021 && 
              <div className="help-right-part">
                <Skeleton className="h-16 w-170 mb-12" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 mb-4" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-16 w-104 mb-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
                <Skeleton className="h-48 w-150 mb-24" baseColor={baseColor2} highlightColor={baseColor} duration='1'/>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}