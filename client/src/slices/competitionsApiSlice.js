import { wodmatchApiSlice } from "../app/api/apiSlice";

export const competitionsApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWZCompetitions: builder.query({
      query: () => ({
        url: `/competitions/get-wz-competitions`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Competition']
    }),
  }),
})

export const { 
  useGetWZCompetitionsQuery
} = competitionsApiSlice