import { createContext, useState, useEffect, useRef } from "react";
import { fr } from 'date-fns/locale'

export const titleApp = 'wodMatch'
export const baseColor = "#ebebeb"
export const baseColor1 = "#DDD"
export const baseColor2 = "#D3D3D3"
export const baseColor3 = "#DCDCDC"
export const baseColor35 = "#bcbcbc"
export const baseColor4 = "#A9A9A9"
export const dateOptions = { locale: fr, timeZone: 'Europe/Paris' }
export const MAX_PHOTOS = 6;

// const dataApplicationsContext = createContext({});
const dataApplicationsContext = createContext({
  searchInputRef: { current: null },
  setSearchInputRef: () => {},
});

export const AppDataProvider = ({ children }) => {
  const [auth, setAuth] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  return (
    <dataApplicationsContext.Provider value={{
      auth, setAuth, isConnected, setIsConnected, windowWidth, setWindowWidth, 
      isAuthLoading, setIsAuthLoading
    }}>
      {children}
    </dataApplicationsContext.Provider>
  )
}

export default dataApplicationsContext;
