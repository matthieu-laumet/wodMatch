import { wodmatchApiSlice } from "../app/api/apiSlice";

export const usersApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentWMUser: builder.query({
      query: () => ({
        url: `/users/get-current-wm-user`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['User']
    }),
    onboardingUser: builder.mutation({
      query: data => ({
          url: `/users/onboarding-user`,
          method: 'post',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User']
    }),
    updateUserProlfil: builder.mutation({
      query: data => ({
          url: `/users/update-user-prolfil`,
          method: 'post',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User']
    }),
    updateUserEmail: builder.mutation({
      query: data => ({
          url: `/users/update-user-email`,
          method: 'PUT',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User']
    }),
    updateUserTelephone: builder.mutation({
      query: data => ({
          url: `/users/update-user-telephone`,
          method: 'PUT',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User']
    }),
  }),
})

export const { 
  useGetCurrentWMUserQuery, useLazyGetCurrentWMUserQuery, useOnboardingUserMutation, useUpdateUserProlfilMutation,
  useUpdateUserEmailMutation, useUpdateUserTelephoneMutation
} = usersApiSlice