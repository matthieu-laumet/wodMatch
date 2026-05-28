import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import dataApplicationsContext from "../../context/dataApplicationsContext";
import Home from "../home/Home";
import { PulseLoader } from "react-spinners";

const RequireAuth = () => {
  const { auth, isAuthLoading } = useContext(dataApplicationsContext);
  const location = useLocation();

  if (isAuthLoading) return <PulseLoader color='#222' size={10} className="mt-12 ml-12" />

  if (!auth?.user?.email) return <Home />;

  const isNewUser = !auth?.user?.has_seen_wodmatch_welcome;
  const onboardingPaths = ['/welcome', '/onboarding'];

  if (isNewUser && !onboardingPaths.includes(location.pathname)) {
    return <Navigate to="/welcome" />;
  }

  return <Outlet />;
}

export default RequireAuth;