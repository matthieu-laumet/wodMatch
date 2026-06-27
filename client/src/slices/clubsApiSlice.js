import { wodzoneApiSlice } from "../app/api/apiSlice";

export const clubsApiSlice = wodzoneApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllClubs: builder.query({
      query: () => ({
        url: `/clubs`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Club']
    }),
  }),
})


export const { 
  useGetAllClubsQuery
} = clubsApiSlice