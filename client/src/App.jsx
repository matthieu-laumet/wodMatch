import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import ErrorFallback from "./components/ErrorFallback";
import ErrorMissing from './components/ErrorMissing';
import Layout from "./components/Layout";
import PersistLogin from "./features/auth/PersistLogin";
import RequireAuth from "./features/auth/RequireAuth";
import WelcomeOnBoard from "./features/home/WelcomeOnBoard";
import Onboarding from "./features/home/Onboarding";
import { ToastContainer } from 'react-toastify';


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
              <Route index element={<WelcomeOnBoard />} />
              <Route path='/onboarding' element={<Onboarding />} />
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