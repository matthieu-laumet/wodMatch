import { wodmatchApiSlice } from "../app/api/apiSlice";

export const strengthsApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStrengths: builder.query({
      query: () => ({
        url: `/strengths/gets-all-strengths`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Strength']
    }),
  }),
})

export const { 
  useGetStrengthsQuery
} = strengthsApiSlice