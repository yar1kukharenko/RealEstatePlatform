import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Realtor } from '@/types/types';

export const realtorsApi = createApi({
  reducerPath: 'realtorsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Realtors'],
  endpoints: (builder) => ({
    getRealtors: builder.query<Realtor[], void>({
      query: () => '/realtors/',
      providesTags: ['Realtors'],
    }),
    addRealtor: builder.mutation<Realtor, Realtor>({
      query: (newRealtor) => ({
        url: '/realtors/',
        method: 'POST',
        body: newRealtor,
      }),
      invalidatesTags: ['Realtors'],
    }),
    updateRealtor: builder.mutation<Realtor, { id: number; data: Realtor }>({
      query: ({ id, data }) => ({
        url: `/realtors/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Realtors'],
    }),
    deleteRealtor: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/realtors/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Realtors'],
    }),
  }),
});

export const {
  useGetRealtorsQuery,
  useAddRealtorMutation,
  useUpdateRealtorMutation,
  useDeleteRealtorMutation,
} = realtorsApi;
