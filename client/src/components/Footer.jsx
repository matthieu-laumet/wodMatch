import { useContext, useState } from "react"
import { titleApp } from "../context/dataApplicationsContext";
import dataApplicationsContext from "../context/dataApplicationsContext";
import { Link, useLocation, useParams } from "react-router-dom";
import getYear from "date-fns/getYear";

export default function Footer() { 
  const { isSideBarOpen,  windowWidth } = useContext(dataApplicationsContext);
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    setInputValue(e.target.value);
  }

  const location = useLocation();
  const { id } = useParams();

  const needMorePaddingB = location.pathname === `/competitions/${id}`;
  const noNeedMarginTop = location.pathname === `/app/dashboard`;
  const leaderboard = location.pathname.includes('leaderboard') && windowWidth < 1021;

  return (
    <>
      {!leaderboard  
        ? <div className={`footer-wrapper ${noNeedMarginTop ? 'mt-0' : ''} ${needMorePaddingB ? 'footer-more-padding' : ''}`} id={location.pathname === '/app/dashboard' ? isSideBarOpen ? "footer-wrapper-sidebar-open" : "footer-wrapper-sidebar-close" : ''}>
          <h1 className="footer-title">INSCRIVEZ-VOUS à notre newsletter, ne rater plus rien !</h1>
          <div className="footer-input-container">
            <input 
              type="text"  className='footer-input' autoComplete="off" value={inputValue} onChange={handleChange} 
              placeholder="Saisissez votre adresse e-mail"
            />
            <i className="bi bi-arrow-right footer-arrow"></i>
          </div>
          <div className="footer-social-container">
            <i className="bi bi-whatsapp"></i>
            <i className="bi bi-facebook"></i>
            <i className="bi bi-instagram"></i>
            <i className="bi bi-twitter"></i>
          </div>
          <div className="footer-links-container">
            <Link to="/" className="footer-link" onClick={() => window.scroll(0,0)}>Centre d'aide</Link>
            <a href={process.env.REACT_APP_FRONT_URL_APP + '/fonctionnement-du-site'} className="footer-link">Fonctionnement du site</a>
            <Link to='/topics/about/60' className="footer-link" onClick={() => window.scroll(0,0)}>Conditions générales</Link>
            <a href={process.env.REACT_APP_FRONT_URL_APP + '/sitemap'} className="footer-link">Plan du site</a>
            <a href={process.env.REACT_APP_FRONT_URL_APP + '/cookie-policy'} className="footer-link">Utilisation des Cookies</a>
          </div>
          <p className="footer-copyright">Copyright ©2026 {titleApp}. Tous droits réservés. {process.env.REACT_APP_VERSION}</p>
        </div>
        : <div className="h-50"></div>
      }
    </>
  )
}