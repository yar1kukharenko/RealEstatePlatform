import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Demand, DemandMutationInput, Offer } from '@/types/types';

export const demandsApi = createApi({
  reducerPath: 'demandsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Demands'],
  endpoints: (builder) => ({
    getDemands: builder.query<Demand[], void>({
      query: () => '/demands/',
      providesTags: ['Demands'],
    }),
    addDemand: builder.mutation<Demand, DemandMutationInput>({
      query: (newDemand) => ({
        url: '/demands/',
        method: 'POST',
        body: newDemand,
      }),
      invalidatesTags: ['Demands'],
    }),
    updateDemand: builder.mutation<Demand, { id: number; data: DemandMutationInput }>({
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
    searchOffersForDemand: builder.query<Offer[], number>({
      query: (id) => `/demands/${id}/search_offers/`,
    }),
  }),
});

export const {
  useGetDemandsQuery,
  useAddDemandMutation,
  useUpdateDemandMutation,
  useDeleteDemandMutation,
  useSearchOffersForDemandQuery,
} = demandsApi;
