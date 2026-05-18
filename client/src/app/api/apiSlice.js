import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logOut } from '../../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  tagTypes: ['User', 'Topic'],
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // console.log(args) // request url, method, body
  // console.log(api) // signal, dispatch, getState()
  // console.log(extraOptions) // Custom like {shout: true}
  
  let result = await baseQuery(args, api, extraOptions)
  
  // If you want, handle other status codes too
  if (result?.error?.status === 403) {
    // console.log('sending refresh token')
    
    // Send refresh token to get new access token
    const refreshResult = await baseQuery('/refresh', api, extraOptions)
    
    if (refreshResult?.data) {
      // console.log(api.getState())
      const user = api.getState().auth.user

      // console.log(refreshResult?.data)

      // Store the new token
      api.dispatch(setCredentials({ ...refreshResult.data, user: refreshResult.data.user }))
      
      // Retry original query with new access token
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logOut())
    }
  } 
  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Topic'],
  endpoints: (builder) => ({})
})