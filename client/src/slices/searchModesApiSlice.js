import { wodmatchApiSlice } from "../app/api/apiSlice";

export const searchModesApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSearchModes: builder.query({
      query: () => ({
        url: `/searchModes/gets-all-searchModes`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['SearchMode']
    }),
    handleUserSearchMode: builder.mutation({
      query: data => ({
          url: `/searchModes/handle-user-search-mode`,
          method: 'POST',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['SearchMode', 'User']
    }),
  }),
})

export const { 
  useGetSearchModesQuery, useHandleUserSearchModeMutation
} = searchModesApiSlice