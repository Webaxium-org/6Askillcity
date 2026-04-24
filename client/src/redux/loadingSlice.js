import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  global: true,
};

export const globalLoadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.global = true;
    },
    stopLoading: (state) => {
      state.global = false;
    },
  },
});

export const { startLoading, stopLoading } = globalLoadingSlice.actions;

export default globalLoadingSlice.reducer;
