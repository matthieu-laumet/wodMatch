import { useEffect, useState, useContext } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import { useNavigate, Link } from "react-router-dom";

export default function UserGoBack({ 
  isSmallDevise, linkSmallDevice, linkLargeDevice, title, titleGoBack, noSubTitle, needAuth, shortTitle, largeDeviceTitle, idCloseStatus, guideInfo,
  goBackLinks, titleClass = 'mb-40'
}) {
  const { setActiveInput, auth, windowWidth } = useContext(dataApplicationsContext);

  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(linkSmallDevice ?? goBackLinks[goBackLinks.length - 2].link);
    setActiveInput(null)
    setActiveInput(null)
  }

  let contentLinks
  if (goBackLinks) {
    contentLinks = 
      <>
        {goBackLinks.map((link, index) => {
          return (
            <div className="d-flex al-item-center" key={index}>
              {index !== goBackLinks.length - 1 
                ? <>
                    <Link to={link.link} className="link-navigation small">{link.label}</Link>
                    <i className='bi bi-chevron-right fz-16 ml-8 mr-0'></i>
                  </>
                : <p className="mb-0 fw-500 fz-13 op-7">{link.label}</p>
              }              
            </div>
          )
        })}
      </>
  } else {
    contentLinks = 
      <>
        <Link to={linkLargeDevice} className="link-navigation">{titleGoBack}</Link>
        {shortTitle?.length > 0 && shortTitle.map((shortT, index) => {
          return (
            <div className="d-flex" key={index}>
              <i className='bi bi-chevron-right fz-16 ml-12 mr-12'></i>
              <p className={`fw-600 fz-14 ${shortTitle.length > 1 ? 'op-5' : ''} ${shortT.includes(idCloseStatus) ? 'op-10' : ''}`}>{shortT}</p>
            </div>
          )
        })}
        {!shortTitle && <>
          <i className='bi bi-chevron-right fz-16 ml-12 mr-12'></i>
          <p className="fw-600 fz-14">{title}</p>
        </>
        }
      </>
  }

  return (
    <>
      {!isSmallDevise 
        ? <>
            <div className="navigation-helper d-flex">
              {contentLinks}
            </div>
            {guideInfo && <p className="mb-0 mt-24 fw-600 fz-14 op-6">{guideInfo}</p>}
            {/* {title && <h3 className="user-setting-part-title mb-40">{largeDeviceTitle ?? title}</h3>} */}
            {(!title && goBackLinks) && <h3 className={`user-setting-part-title ${titleClass} ${titleClass} ${windowWidth < 1021 ? 'w-100p' : ''}`}>{goBackLinks[goBackLinks.length - 1].label}</h3>}
          </>
        : <>
            <div className="d-flex mb-24" onClick={handleGoBack}>
              <i className={`bi bi-chevron-left subMenu-chevron`}></i>
              {goBackLinks && goBackLinks[goBackLinks.length - 2] && <p className="mb-0 ml-16 fw-500 cursor-pointer">{goBackLinks[goBackLinks.length - 2].label}</p>}
            </div>
            {guideInfo && <p className="mb-0 mt-24 fw-600 fz-14 op-6">{guideInfo}</p>}
            {(!title && goBackLinks) && <h3 className={`user-setting-part-title ${titleClass} ${windowWidth < 1021 ? 'w-100p' : ''}`}>{goBackLinks[goBackLinks.length - 1].label}</h3>}
          </>
      }
    </>
  )
}