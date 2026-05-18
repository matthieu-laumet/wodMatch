import { Link } from "react-router-dom";
import dataApplicationsContext from '../context/dataApplicationsContext';
import { useContext } from 'react';

const ErrorMissing = () => {
  const { windowWidth } = useContext(dataApplicationsContext);

  const limitWidth = 800;
  const src = windowWidth >= limitWidth ? "/images/404_lg.webp" : "/images/404_wodzone.png";
  
  return (
    <div className={`bodyContainer`}>
      <div className="oops-container" id="oops-container-404">
        <div className="oops-wrapper" id="oops-wrapper-404">
          <div className="oops-content" id="oops-content-404">
            <div className="oops-text">
              <div className="oops-title-container">
                <h1 className="oops-title">"NO REP"</h1>
              </div>
              <p className="detail-error-msg">Désolé, mais cette page n'existe pas...</p>
            </div>
            <Link to="/" className="oops-btn">Retour à l'accueil</Link>
          </div>
          <img src={src} alt="Error-404" className={`img-error ${windowWidth >= 1200 ? 'xl' : windowWidth >= limitWidth ? 'lg' : ''}`}></img>
        </div>
      </div>
    </div>
  )
}

export default ErrorMissing