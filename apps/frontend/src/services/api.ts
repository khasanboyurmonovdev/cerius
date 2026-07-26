import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query base API. Feature endpoints are added with `ceriusApi.injectEndpoints`
 * from their own slices — this file stays free of feature logic.
 */
export const ceriusApi = createApi({
  reducerPath: 'ceriusApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1',
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
