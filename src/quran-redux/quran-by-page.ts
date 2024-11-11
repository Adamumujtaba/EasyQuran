import {quranBaseApi} from './quran-api';

export const quranByPage = quranBaseApi.injectEndpoints({
  endpoints: builder => ({
    getSurahLists: builder.query<any, void>({
      query: () => ({
        url: '/surah',
      }),
      providesTags: ['SURAHS'],
    }),
    getSurah: builder.query<any, any>({
      query: ({id}) => ({
        url: `/surah/${id}`,
      }),
      providesTags: ['SURAHS'],
    }),
  }),
  overrideExisting: true,
});

export interface Surah {
  number: number;
  name: any;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

// Define the type for a single Ayah
export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}
export const {useGetSurahListsQuery, useGetSurahQuery} = quranByPage;
