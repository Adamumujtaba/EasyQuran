import {createSlice} from '@reduxjs/toolkit';
import {Surah} from './quran-by-page';

export interface QuranState {
  data: Surah;
}

const initialState = {};

const setData = (state: any, {payload: data}: any) => {
  state = data;
  return state;
};

export const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    fetchData: setData,
  },
});

// Action creators are generated for each case reducer function
export const {fetchData} = quranSlice.actions;

export default quranSlice.reducer;
