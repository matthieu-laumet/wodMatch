import { wodmatchApiSlice, wodzoneApiSlice } from "../app/api/apiSlice";

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
    getBlockedAthlets: builder.query({
      query: () => ({
        url: `/users/get-blocked-athlets`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['User', 'Blocked']
    }),
    getVisiblesAthleteLists: builder.query({
      query: () => ({
        url: `/users/get-visibles-athlete-lists`,
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
    addBlockedUser: builder.mutation({
      query: data => ({
          url: `/users/add-blocked-user`,
          method: 'post',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User', 'Blocked']
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
    handleHideUserProfil: builder.mutation({
      query: data => ({
          url: `/users/handle-hide-user-profil`,
          method: 'PUT',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User']
    }),
    deleteBlockedUser: builder.mutation({
      query: data => ({
          url: `/users/delete-blocked-user`,
          method: 'PUT',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['User']
    }),
    deleteBlockedUser: builder.mutation({
      query: ({ id_user_blocked, blocked_email }) => ({  // ← destructure l'objet
        url: `/users/delete-blocked-user/${id_user_blocked}/${encodeURIComponent(blocked_email)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Blocked']  // ← doit être au même niveau que query
    }),
  }),
})

export const wodzoneUsersApiSlice = wodzoneApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserBoxVisibilities: builder.query({
      query: () => ({
        url: `/users/get-user-box-visibilities`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['User']
    }),
    upsertUserVisibility: builder.mutation({
      query: initialUsersData => ({
          url: `/users/upsert-visibility`,
          method: 'post',
          body: {
              ...initialUsersData,
          }
      }),
      invalidatesTags: ["User"]
    }),
    updateUserClubVisibilities: builder.mutation({
      query: initialUsersData => ({
          url: `/users/update-user-box-visibilities`,
          method: 'put',
          body: {
              ...initialUsersData,
          }
      }),
      invalidatesTags: ["User"]
    }),
  }),
})

export const { 
  useGetCurrentWMUserQuery, useLazyGetCurrentWMUserQuery, useOnboardingUserMutation, useUpdateUserProlfilMutation,
  useUpdateUserEmailMutation, useUpdateUserTelephoneMutation, useHandleHideUserProfilMutation,
  useGetBlockedAthletsQuery, useAddBlockedUserMutation, useDeleteBlockedUserMutation, useGetVisiblesAthleteListsQuery
} = usersApiSlice

export const { 
  useGetUserBoxVisibilitiesQuery, useUpsertUserVisibilityMutation, useUpdateUserClubVisibilitiesMutation
} = wodzoneUsersApiSlice