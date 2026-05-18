import { createContext, useState, useEffect, useRef } from "react";
import { fr } from 'date-fns/locale'

export const titleApp = 'Wodzone'
export const baseColor = "#ebebeb"
export const baseColor1 = "#DDD"
export const baseColor2 = "#D3D3D3"
export const baseColor3 = "#DCDCDC"
export const baseColor35 = "#bcbcbc"
export const baseColor4 = "#A9A9A9"
export const dateOptions = { locale: fr, timeZone: 'Europe/Paris' }

// const dataApplicationsContext = createContext({});
const dataApplicationsContext = createContext({
  searchInputRef: { current: null },
  setSearchInputRef: () => {},
});

export const AppDataProvider = ({ children }) => {
  const [auth, setAuth] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const [homeOngletActif, setHomeOngletActif] = useState('');
  const [ongletPaiementActif, setOngletPaiementActif] = useState('');
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  return (
    <dataApplicationsContext.Provider value={{
      auth, setAuth, activeInput, setActiveInput, hasScrollbar, setHasScrollbar, isScrollingDown, setIsScrollingDown, 
      isConnected, setIsConnected, windowWidth, setWindowWidth, ongletPaiementActif, setOngletPaiementActif,
      prevScrollPos, setPrevScrollPos, search, setSearch, isSearchActive, setIsSearchActive, searchInputRef, homeOngletActif, setHomeOngletActif
    }}>
      {children}
    </dataApplicationsContext.Provider>
  )
}

export default dataApplicationsContext;
