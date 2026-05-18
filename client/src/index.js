import React from 'react';
import ReactDOM from 'react-dom/client';
import './stylesheets/main.css';
import App from './App.jsx';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';

import { store } from './app/store.js'
import { Provider } from 'react-redux'

import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AppDataProvider } from './context/dataApplicationsContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AppDataProvider >
              <Routes>
                <Route path='/*' element={<App />} />
              </Routes>
            </ AppDataProvider >
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
