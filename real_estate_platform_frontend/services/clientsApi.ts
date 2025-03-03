import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Client, Demand, Offer } from '@/types/types';

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['clients'],
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      query: () => '/clients/',
      providesTags: ['clients'],
    }),
    getClientRelated: builder.query<
      {
        offers: Offer[];
        demands: Demand[];
      },
      number
    >({
      query: (clientId) => `/clients/${clientId}/related/`,
    }),
    addClient: builder.mutation<Client, Partial<Client>>({
      query: (newClient) => ({
        url: '/clients/',
        method: 'POST',
        body: newClient,
      }),
      invalidatesTags: ['clients'],
    }),
    updateClient: builder.mutation<Client, { id: number; data: Partial<Client> }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['clients'],
    }),
    deleteClient: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/clients/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['clients'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientRelatedQuery,
} = clientsApi;
