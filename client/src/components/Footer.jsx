import { useContext, useState } from "react"
import { titleApp } from "../context/dataApplicationsContext";
import dataApplicationsContext from "../context/dataApplicationsContext";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import getYear from "date-fns/getYear";

export default function Footer() { 
  const { auth, isSideBarOpen,  windowWidth } = useContext(dataApplicationsContext);
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    setInputValue(e.target.value);
  }

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (link) => {
    window.scroll(0,0)
    navigate(link)
  }

  if (location.pathname === '/profil/edit') return null;
  
  let content
  if (auth?.user?.has_seen_wodmatch_welcome) {
    const fill = (path) =>  location.pathname.startsWith(path) ? `-fill text-[#df0000]` : '';
    content = 
      <div className="footer-icons-containe">
        <i className={`bi bi-trophy${fill('/competitions')} cursor-pointer text-2xl`} onClick={() => handleNavigate('/competitions')}></i>
        <i className={`bi bi-heart${fill('/favoris')} cursor-pointer text-2xl`} onClick={() => handleNavigate('/favoris')}></i>
        <i className={`bi bi-chat${fill('/chat')} cursor-pointer text-2xl`} onClick={() => handleNavigate('/chat')}></i>
        <i className={`bi bi-person${fill('/profil')} cursor-pointer text-3xl`} onClick={() => handleNavigate('/profil')}></i>
      </div>
  } else {
    const footerClass = (location.pathname === `/` && !auth?.user?.email) ? 'mt-[60px]' : '';
    content = 
      <div className={`footer-wrapper ${footerClass}`}>
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
  }

  return content
}