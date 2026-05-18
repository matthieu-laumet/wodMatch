import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
// import Navbar from './Navbar';
import Footer from './Footer';
import dataApplicationsContext from "../context/dataApplicationsContext";
import { useContext } from "react";
import Navbar from "./Navbar";
// import useCanModeTest from "../hooks/useCanModeTest";

const Layout = () => {
  const { setWindowWidth, prevScrollPos, setPrevScrollPos, setIsScrollingDown, setHasScrollbar, windowWidth } = useContext(dataApplicationsContext);

  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Permet de determiner si scroll vers le bas ou vers le haut
  useEffect(() => {
    if (!location.pathname.includes('app/dashboard')) {
      const handleScroll = () => {
        const currentScrollPos = window.pageYOffset;
        const isVisible = currentScrollPos > 60 && (prevScrollPos < currentScrollPos);
        setIsScrollingDown(isVisible);
        setPrevScrollPos(currentScrollPos);
      };
      // console.log(window.scrollY)
      window.addEventListener('scroll', handleScroll);
  
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [prevScrollPos, location.pathname]);

  
  useEffect(() => {
    const handleResize = () => {
      // Vérifier si la hauteur du document est supérieure à la hauteur de la fenêtre
      const hasVerticalScrollbar = document.documentElement.scrollHeight > window.innerHeight;

      // Vérifier si la largeur du document est supérieure à la largeur de la fenêtre
      const hasHorizontalScrollbar = document.documentElement.scrollWidth > window.innerWidth;

      // Mettre à jour l'état en fonction de la présence ou non des barres de défilement
      setHasScrollbar(hasVerticalScrollbar || hasHorizontalScrollbar);
    };

    // Écouter les événements de redimensionnement de la fenêtre
    window.addEventListener('resize', handleResize);

    // Appeler handleResize une fois pour détecter initialement la présence des barres de défilement
    handleResize();

    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  


  return (
    <>
      {location.pathname !== "/auth" && <Navbar />}
      <div className="mainContainer">
        <Outlet />
      </div>
      {location.pathname !== "/auth" && <Footer />}
    </>
  )
}

export default Layout
