import { Outlet, useLocation } from "react-router-dom";
import Footer from './Footer';
import Navbar from "./Navbar";

const Layout = () => {
  const location = useLocation();

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
