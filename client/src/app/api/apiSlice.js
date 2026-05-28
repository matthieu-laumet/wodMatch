import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logOut } from '../../features/auth/authSlice';

const createBaseQuery = (baseUrl) => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    }
  });

  return async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result?.error?.status === 403) {
      const refreshResult = await baseQuery('/refresh', api, extraOptions);
      if (refreshResult?.data) {
        api.dispatch(setCredentials({ ...refreshResult.data }));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logOut());
      }
    }
    return result;
  };
};

export const createAppApi = (reducerPath, baseUrl, tagTypes = []) =>
  createApi({
    reducerPath,
    baseQuery: createBaseQuery(baseUrl),
    tagTypes,
    endpoints: () => ({})
  });

  // apiSlice.js
export const wodzoneApiSlice = createAppApi('api', process.env.REACT_APP_BASE_URL, ['User']);

// wodmatchApiSlice.js
export const wodmatchApiSlice = createAppApi('wodmatchApi', process.env.REACT_APP_WODMATCH_URL, 
  ['Profile', 'Strength', 'FunRep', 'Level']
);