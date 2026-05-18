import dataApplicationsContext from '../context/dataApplicationsContext';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useSendLogoutMutation } from '../features/auth/authApiSlice';
import secureLocalStorage from "react-secure-storage";
import { useScrollLock } from '../hooks/useScrollLock';
import SearchInput from './SearchInput';

const Navbar = () => {
  const { auth, setAuth, setIsConnected, windowWidth, setIsSearchActive } = useContext(dataApplicationsContext);

  const navigate = useNavigate();
  const [sendLogout] = useSendLogoutMutation();
  const location = useLocation();
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { lockScroll, unlockScroll } = useScrollLock();

  useEffect(() => {
    if (showSubMenu && windowWidth < 1021) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }, [showSubMenu]);

  const handleLogout = () => {
    sendLogout();
    window.scrollTo({ top: 0, left: 0 })
    setAuth([]);
    secureLocalStorage.removeItem('jwt');
    secureLocalStorage.removeItem('account-session');
    setIsConnected(false);
    const restrictedPaths = ['/register', '/dashboard', '/account-settings'];
    const isRestrictedPath = restrictedPaths.some(path => location.pathname.includes(path));
    isRestrictedPath && navigate('/');
  }

  const fullname = auth?.user?.first_name + auth?.user?.last_name;

  const handleNav = (link, generateCookie, isHelpService) => {
    if (generateCookie) {
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 20);
      const dataToShare = {
        urlRedirect: process.env.REACT_APP_FRONT_URL
      }
      // document.cookie = `helpRedirect=${JSON.stringify(dataToShare)}; path=/; expires=${expirationDate.toUTCString()}`;
      document.cookie = `helpRedirect=${JSON.stringify(dataToShare)}; domain=.wodzone.fr; path=/; expires=${expirationDate.toUTCString()}`;
    }
    if (isHelpService) {  // si redirection vers un autre lien de l'app help
      navigate(link)
    } else {
      window.location.href = link;
    }
  }

  const showSearchBar = !['/', '/how-wodzone-works'].includes(location.pathname)

  return (
    <nav className={`nav nav-black`}>
      <div className={`nav-logo-title-container`} onClick={() => navigate('/')}>
        <img src={"/images/logo_home.png"} alt="logo_home_noir" className={`h-65p mr-16`} />
        <p className='nav-title'>Centre d'aide</p>
      </div>
      {(showSearchBar && windowWidth >= 744) &&
        <SearchInput formClass={`chart-search-container min-h-40`} wrapperClass="pos-rel z-10 fl-gr-1 ml-32 mr-32 max-w-450" color={'#fff'}/>
      }
      <div className="nav-right-wrapper">
        <div className="menu-icon nav-right">
          {(showSearchBar && windowWidth < 744) &&
            <i className={`fa-solid fa-magnifying-glass loupe-nav`} onClick={() => setIsSearchActive(true)}></i>
          }
          {windowWidth >= 744 && 
            <a href={`${process.env.REACT_APP_FRONT_URL_APP}/competitions`} target='_blank' className="HWW-button pt-10 pb-10 fz-14 naving-bar">
              Commencer ma recherche
            </a>
          }
          <div className='pos-rel' onClick={() => setShowSubMenu(!showSubMenu)}>
            {auth?.user?.email 
              ? <img 
                  src={auth?.user?.avatar ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${fullname}`} alt="avatar" className="avatar"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src='https://res.cloudinary.com/dkz9knsgj/image/upload/v1705258636/avatar_placeholder.svg';
                  }}
                ></img>
              : <i className="bi bi-person nav-people-icon"></i>
            }
            {showSubMenu &&
              <>
                <div className="auth-sub-menu-container">
                  <p className='auth-menulink' onClick={() => handleNav(`/topics`, false, 'isHelpService')}>Toutes les rubriques d'aide</p>
                  <span className='nav-separator'></span>
                  {!auth?.user?.first_name && <p className='auth-menulink' onClick={() => handleNav(`${process.env.REACT_APP_FRONT_URL_APP}/auth`, 'generateCookie')}>Connexion</p>}
                  {!auth?.user?.first_name && <p className='auth-menulink' onClick={() => handleNav(`${process.env.REACT_APP_FRONT_URL_APP}/auth`, 'generateCookie')}>Inscription</p>}
                  {auth?.user?.first_name && 
                    <>
                      <p className='auth-menulink' onClick={() => handleNav(`${process.env.REACT_APP_FRONT_URL_APP}/account-settings/events`)}>Mes inscriptions</p>
                      <p className='auth-menulink' onClick={() => handleNav(`${process.env.REACT_APP_FRONT_URL_APP}/account-settings`)}>Favoris</p>
                    </>
                  }
                  <span className='nav-separator'></span>
                  <a className='auth-menulink' href='https://www.wodzone.fr' target='_blank'>Devenez organisateur</a>
                  {auth?.user?.first_name && 
                      <p className='auth-menulink' onClick={() => handleNav(`${process.env.REACT_APP_FRONT_URL_APP}/account-settings`)}>Compte</p>
                  }
                  <span className='nav-separator'></span>
                  <a className='auth-menulink' href={process.env.REACT_APP_FRONT_URL_APP}>Retour sur l'App</a>
                  {auth?.user?.first_name && <span className='nav-separator'></span>}
                  {auth?.user?.first_name && <p className='auth-menulink' onClick={handleLogout}>Se déconnecter</p>}
                </div>
                <div className={`background-close ${windowWidth < 744 ? 'help' : ''}`} onClick={() => setShowSubMenu(false)}></div>
              </>
            }
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar