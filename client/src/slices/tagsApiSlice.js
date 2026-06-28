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
    getEventModes: builder.query({
      query: () => ({
        url: `/competitions/event-modes`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Competition', 'EventMode']
    }),
  }),
})


export const { 
  useGetTagsQuery, useGetEventModesQuery
} = tagsApiSlice