import { Navigate, Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import Home from "../home/Home";
import { PulseLoader } from "react-spinners";

const RequireAuth = () => {
  const { auth, isAuthLoading } = useContext(dataApplicationsContext);

  if (isAuthLoading) return (
    <PulseLoader color='#222' size={10} className="mt-12 ml-12"/>
  )

  if (!auth?.user?.email) return <Home />;
  // si c'est la premiere fois que le user decrouvre wodmatch
  if (!auth?.user?.has_seen_wodmatch_welcome) return <Outlet />;

  return <Navigate to="/onboarding" />;
}

export default RequireAuth;