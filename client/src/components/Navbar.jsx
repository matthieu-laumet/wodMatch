import dataApplicationsContext, { titleApp } from '../context/dataApplicationsContext';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useSendLogoutMutation } from '../features/auth/authApiSlice';
import secureLocalStorage from "react-secure-storage";
import { useScrollLock } from '../hooks/useScrollLock';
import SearchInput from './SearchInput';
import GetAvatar from './GetAvatar';

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

  const handleNav = ({ url, generateCookie }) => {
    if (generateCookie) {
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 20);
      const cookieName = 'wodMatchRedirect';
      const dataToShare = { urlRedirect: process.env.REACT_APP_FRONT_URL, cookieName }
      document.cookie = `${cookieName}=${JSON.stringify(dataToShare)}; domain=.wodzone.fr; path=/; expires=${expirationDate.toUTCString()}`;
    }
    window.location.href = url;
  }

  const showSearchBar = !['/', '/how-wodzone-works'].includes(location.pathname);

  return (
    <nav className={`nav nav-black`}>
      <div className={`nav-logo-title-container`} onClick={() => navigate('/')}>
        <img src={"/images/logo_home.png"} alt="logo_home_noir" className={`h-3/5`} />
        <p className='nav-title hidden sm:block'>{titleApp}</p>
      </div>
      <div className="nav-right-wrapper">
        <div className="menu-icon nav-right h-3/5">
          {(showSearchBar && windowWidth < 744) &&
            <i className={`fa-solid fa-magnifying-glass loupe-nav`} onClick={() => setIsSearchActive(true)}></i>
          }
          {auth?.user?.email && 
            <div className='pos-rel'>
              <GetAvatar 
                filename={auth?.user?.avatar} 
                fullname={fullname} 
                className={'avatar'} 
                skeletonClasses={'skeleton-avatar'}
              />
            </div>
          }
        </div>
      </div>
    </nav>
  )
}

export default Navbar