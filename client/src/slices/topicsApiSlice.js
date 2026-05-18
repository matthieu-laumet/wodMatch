// import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
// import { apiSlice } from "../app/api/apiSlice";

// const topicsAdapter = createEntityAdapter({})
// const initialState = topicsAdapter.getInitialState();

// export const topicsApiSlice = apiSlice.injectEndpoints({
//   endpoints: builder => ({
//     getAllTopics: builder.query({
//       query: () => ({
//         url: '/topics',
//         validateStatus: (response, result) => {
//           return response.status === 200 && !result.isError
//         }, 
//       }),
//       providesTags: ['Topic']
//     }),
//     getTopicByID: builder.query({
//       query: (id_topic) => ({
//         url: id_topic && `/topics/${id_topic}`,
//         validateStatus: (response, result) => {
//           return response.status === 200 && !result.isError
//         }, 
//       }),
//       providesTags: ['Topic']
//     }),
//     CountIsUtile: builder.mutation({
//       query: initialWodData => ({
//           url: `/topics/update-count-isUtile`,
//           method: 'put',
//           body: {
//               ...initialWodData,
//           }
//       }),
//       invalidatesTags: ['Topic']
//     }),
//   })
// })


// export const { 
//   useGetAllTopicsQuery, useGetTopicByIDQuery, useCountIsUtileMutation
// } = topicsApiSlice