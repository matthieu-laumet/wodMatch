import { wodmatchApiSlice } from "../app/api/apiSlice";

export const funRepsApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFunReps: builder.query({
      query: () => ({
        url: `/funReps/gets-all-funReps`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['FunRep']
    }),
  }),
})

export const { 
  useGetFunRepsQuery
} = funRepsApiSlice