import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Demand, Offer, OfferMutationInput } from '@/types/types';

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Offers'],
  endpoints: (builder) => ({
    getOffers: builder.query<Offer[], void>({
      query: () => '/offers/',
      providesTags: ['Offers'],
    }),
    addOffer: builder.mutation<Offer, OfferMutationInput>({
      query: (newOffer) => ({
        url: '/offers/',
        method: 'POST',
        body: newOffer,
      }),
      invalidatesTags: ['Offers'],
    }),
    updateOffer: builder.mutation<Offer, { id: number; data: OfferMutationInput }>({
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
    searchDemandsForOffer: builder.query<Demand[], number>({
      query: (id) => `/offers/${id}/search_demands/`,
    }),
  }),
});

export const {
  useGetOffersQuery,
  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useSearchDemandsForOfferQuery,
} = offersApi;
