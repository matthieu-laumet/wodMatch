import { wodzoneApiSlice } from "../app/api/apiSlice";

export const favoritesApiSlice = wodzoneApiSlice.injectEndpoints({
  endpoints: builder => ({
    getUserCompetFavorites: builder.query({
      query: () => ({
        url: `/favorites/get-user-compet-favorites`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Favorite']
    }),
    toggleUserCompetFavoris: builder.mutation({
      query: initialFavoriteData => ({
          url: `/favorites/toggle-user-compet-favoris`,
          method: 'POST',
          body: {
              ...initialFavoriteData,
          }
      }),
      invalidatesTags: ['Favorite']
    }),
  })
})


export const { 
  useGetUserCompetFavoritesQuery, useToggleUserCompetFavorisMutation
} = favoritesApiSlice
