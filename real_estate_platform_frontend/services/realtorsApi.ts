import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Realtor } from '@/types/types';

export const realtorsApi = createApi({
  reducerPath: 'realtorsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['realtors'],
  endpoints: (builder) => ({
    getRealtors: builder.query<Realtor[], void>({
      query: () => '/realtors/',
      providesTags: ['realtors'],
    }),
    addRealtor: builder.mutation<Realtor, Realtor>({
      query: (newRealtor) => ({
        url: '/realtors/',
        method: 'POST',
        body: newRealtor,
      }),
      invalidatesTags: ['realtors'],
    }),
    updateRealtor: builder.mutation<Realtor, { id: number; data: Realtor }>({
      query: ({ id, data }) => ({
        url: `/realtors/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['realtors'],
    }),
    deleteRealtor: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/realtors/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['realtors'],
    }),
  }),
});

export const {
  useGetRealtorsQuery,
  useAddRealtorMutation,
  useUpdateRealtorMutation,
  useDeleteRealtorMutation,
} = realtorsApi;
