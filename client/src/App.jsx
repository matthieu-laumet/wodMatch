import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import ErrorFallback from "./components/ErrorFallback";
import ErrorMissing from './components/ErrorMissing';
import Layout from "./components/Layout";
import PersistLogin from "./features/auth/PersistLogin";
import HelpIndex from "./features/HelpIndex";


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
      <Routes>
        <Route element={<PersistLogin />}>
          <Route path='/' element={<Layout />}>
            <Route index element={<HelpIndex />} />
            <Route path='/500' element={<ErrorFallback noFooter={true}/>} />
            <Route path='*' element={<ErrorMissing />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;