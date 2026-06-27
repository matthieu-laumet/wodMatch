import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import ErrorFallback from "./components/ErrorFallback";
import ErrorMissing from './components/ErrorMissing';
import Layout from "./components/Layout";
import PersistLogin from "./features/auth/PersistLogin";
import RequireAuth from "./features/auth/RequireAuth";
import WelcomeOnBoard from "./features/home/WelcomeOnBoard";
import Onboarding from "./features/home/Onboarding";
import { ToastContainer } from 'react-toastify';
import Profil from "./features/user/Profil";
import ExploreWorld from "./features/user/ExploreWorld";
import Competitions from "./features/competitions/Competitions";
import EditProfile from "./features/user/EditProfile";
import Settings from "./features/user/Settings";
import EditPhotos from "./features/user/EditPhotos";
import BlockAthletes from "./features/user/BlockAthletes";
import AddBlockAthlete from "./features/user/AddBlockAthlete";
import Visibility from "./features/user/Visibility";


function App() {
  const documentHeight = () => {
  const doc = document.documentElement
    doc.style.setProperty('--doc-height', `${window.innerHeight}px`)
  }
  useEffect(() => {
    window.addEventListener('resize', documentHeight);
    documentHeight();
    return () => window.removeEventListener('resize', documentHeight);
  }, []);

  const [currentCompetId, setCurrentCompetId] = useState(
    () => localStorage.getItem('currentCompetId') // lazy init ✅ réactif au mount
  );

  return (
    <>
      <ToastContainer
        position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick
        rtl={false} draggable pauseOnHover
      />
      <Routes>
        <Route element={<PersistLogin />}>
          <Route path='/' element={<Layout />}>
            <Route element={<RequireAuth />}>
              <Route index element={currentCompetId ? <ExploreWorld /> : <Competitions />} />
              <Route path='/welcome' element={<WelcomeOnBoard />} />
              <Route path='/onboarding' element={<Onboarding />} />
              <Route path='/competitions' element={<Competitions />} />
              <Route path='/favoris' element={<Profil />} />
              <Route path='/chat' element={<Profil />} />
              <Route path='profil'>
                <Route index element={<Profil />} />
                <Route path='edit' element={<EditProfile />} />
                <Route path='edit-pictures' element={<EditPhotos />} />
                <Route path='settings'>
                  <Route index element={<Settings />} />
                  <Route path='block-athletes' element={<BlockAthletes />} />
                  <Route path='visibility' element={<Visibility />} />
                  <Route path='block-athletes/add-contact' element={<AddBlockAthlete />} />
                </Route>
              </Route>
            </Route>
            <Route path='/500' element={<ErrorFallback noFooter={true}/>} />
            <Route path='*' element={<ErrorMissing />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;