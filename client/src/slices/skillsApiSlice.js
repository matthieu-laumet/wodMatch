import { wodmatchApiSlice } from "../app/api/apiSlice";

export const skillsApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSkills: builder.query({
      query: () => ({
        url: `/skills/gets-all-skills`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }, 
      }),
      providesTags: ['Skill']
    }),
    CleanUpsertUserSkills: builder.mutation({
      query: data => ({
          url: `/skills/clean-upsert-user-skills`,
          method: 'post',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['Skill']
    }),
  }),
})

export const { 
  useGetSkillsQuery, useCleanUpsertUserSkillsMutation
} = skillsApiSlice