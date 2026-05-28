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
  }),
})

export const { 
  useGetCurrentWMUserQuery, useLazyGetCurrentWMUserQuery, useOnboardingUserMutation
} = usersApiSlice