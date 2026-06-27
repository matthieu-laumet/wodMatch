import { wodzoneApiSlice } from "../app/api/apiSlice";

export const tagsApiSlice = wodzoneApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query({
      query: () => ({
        url: `/tags/get-all-tags`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Tag', 'Competition']
    }),
  }),
})


export const { 
  useGetTagsQuery
} = tagsApiSlice