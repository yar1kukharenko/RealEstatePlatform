import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Demand } from '@/types/types';

export const demandsApi = createApi({
  reducerPath: 'demandsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Demands'],
  endpoints: (builder) => ({
    getDemands: builder.query<Demand[], void>({
      query: () => '/demands/',
      providesTags: ['Demands'],
    }),
    addDemand: builder.mutation<Demand, Partial<Demand>>({
      query: (newDemand) => ({
        url: '/demands/',
        method: 'POST',
        body: newDemand,
      }),
      invalidatesTags: ['Demands'],
    }),
    updateDemand: builder.mutation<Demand, { id: number; data: Partial<Demand> }>({
      query: ({ id, data }) => ({
        url: `/demands/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Demands'],
    }),
    deleteDemand: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/demands/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Demands'],
    }),
  }),
});

export const {
  useGetDemandsQuery,
  useAddDemandMutation,
  useUpdateDemandMutation,
  useDeleteDemandMutation,
} = demandsApi;
