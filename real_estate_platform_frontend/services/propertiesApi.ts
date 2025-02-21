import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Property } from '@/types/types';

export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['properties'],
  endpoints: (builder) => ({
    getProperties: builder.query<Property[], void>({
      query: () => '/properties/',
      providesTags: ['properties'],
    }),
    addProperty: builder.mutation<Property, Partial<Property>>({
      query: (newProperty) => ({
        url: '/properties/',
        method: 'POST',
        body: newProperty,
      }),
      invalidatesTags: ['properties'],
    }),
    updateProperty: builder.mutation<Property, { id: number; data: Partial<Property> }>({
      query: ({ id, data }) => ({
        url: `/properties/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['properties'],
    }),
    deleteProperty: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/properties/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['properties'],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useAddPropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi;
