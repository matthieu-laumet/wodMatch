import { configureStore } from "@reduxjs/toolkit";
import { wodmatchApiSlice, wodzoneApiSlice } from './api/apiSlice';
import authReducer from '../features/auth/authSlice';


export const store = configureStore({
  reducer: {
    [wodzoneApiSlice.reducerPath]: wodzoneApiSlice.reducer,
    [wodmatchApiSlice.reducerPath]: wodmatchApiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(wodzoneApiSlice.middleware)
      .concat(wodmatchApiSlice.middleware),
  devTools: true,
});