import { configureStore } from '@reduxjs/toolkit';
import pagesReducer from './pagesSlice';

export const store = configureStore({
  reducer: {
    pages: pagesReducer,
  },
});
