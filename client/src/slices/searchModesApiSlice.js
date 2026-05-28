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
  }),
})

export const { 
  useGetSearchModesQuery
} = searchModesApiSlice