import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Deal } from '@/types/types';

export const dealsApi = createApi({
  reducerPath: 'dealsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Deals'],
  endpoints: (builder) => ({
    getDeals: builder.query<Deal[], void>({
      query: () => '/deals/',
      providesTags: ['Deals'],
    }),
    addDeal: builder.mutation<Deal, Partial<Deal>>({
      query: (newDeal) => ({
        url: '/deals/',
        method: 'POST',
        body: newDeal,
      }),
      invalidatesTags: ['Deals'],
    }),
    updateDeal: builder.mutation<Deal, { id: number; data: Partial<Deal> }>({
      query: ({ id, data }) => ({
        url: `/deals/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Deals'],
    }),
    deleteDeal: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/deals/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Deals'],
    }),
  }),
});

export const {
  useGetDealsQuery,
  useAddDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
} = dealsApi;
