import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Client } from '@/types/types';

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Clients'],
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      query: () => '/clients/',
      providesTags: ['Clients'],
    }),
    addClient: builder.mutation<Client, Partial<Client>>({
      query: (newClient) => ({
        url: '/clients/',
        method: 'POST',
        body: newClient,
      }),
      invalidatesTags: ['Clients'],
    }),
    updateClient: builder.mutation<Client, { id: number; data: Partial<Client> }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Clients'],
    }),
    deleteClient: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/clients/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApi;
