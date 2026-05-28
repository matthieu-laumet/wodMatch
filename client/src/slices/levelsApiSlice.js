import { wodmatchApiSlice } from "../app/api/apiSlice";

export const levelsApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLevels: builder.query({
      query: () => ({
        url: `/levels/gets-all-levels`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Level']
    }),
  }),
})

export const { 
  useGetLevelsQuery
} = levelsApiSlice