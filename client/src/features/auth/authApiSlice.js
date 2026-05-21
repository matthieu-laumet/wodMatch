import { wodzoneApiSlice } from "../../app/api/apiSlice";
import { logOut, setCredentials } from "./authSlice";

export const authApiSlice = wodzoneApiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: '/users/login', 
        method: 'POST',
        body: { ...credentials }
      }),
      invalidatesTags: ["User"]
    }),
    isUser: builder.mutation({
      query: credentials => ({
        url: '/users/isUser', 
        method: 'POST',
        body: { ...credentials }
      })
    }),
    sendLogout: builder.mutation({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          // console.log(data)
          dispatch(logOut())
          // setTimeout(() => {
            // dispatch(apiSlice.util.resetApiState())
          // }, 1000)
        } catch (err) {
          console.log(err)
        }
      }
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/refresh',
        method: 'GET',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
            const { data } = await queryFulfilled
            // console.log(data)
            const { accessToken, user } = data
            dispatch(setCredentials({ accessToken, user }))
        } catch (err) {
            console.log(err)
        }
      }
    }),
  })
})

export const { useLoginMutation, useIsUserMutation, useSendLogoutMutation, useRefreshMutation } = authApiSlice