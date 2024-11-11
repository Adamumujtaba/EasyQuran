import {
  createApi,
  fetchBaseQuery,
  TagDescription,
} from '@reduxjs/toolkit/query/react';
const tagTypes = ['SURAHS'] as const;
import {BASE_URL} from '@env';

export const quranBaseApi = createApi({
  baseQuery: fetchBaseQuery({baseUrl: BASE_URL}),
  tagTypes,
  reducerPath: 'baseApi',
  endpoints: () => ({}),
  keepUnusedDataFor: 3000000000000,
});

export type ApiTags = ReadonlyArray<TagDescription<(typeof tagTypes)[number]>>;
