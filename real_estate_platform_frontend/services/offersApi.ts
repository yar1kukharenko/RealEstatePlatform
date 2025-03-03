import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Offer } from '@/types/types';

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Offers'],
  endpoints: (builder) => ({
    getOffers: builder.query<Offer[], void>({
      query: () => '/offers/',
      providesTags: ['Offers'],
    }),
    addOffer: builder.mutation<Offer, Partial<Offer>>({
      query: (newOffer) => ({
        url: '/offers/',
        method: 'POST',
        body: newOffer,
      }),
      invalidatesTags: ['Offers'],
    }),
    updateOffer: builder.mutation<Offer, { id: number; data: Partial<Offer> }>({
      query: ({ id, data }) => ({
        url: `/offers/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Offers'],
    }),
    deleteOffer: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/offers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Offers'],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offersApi;
