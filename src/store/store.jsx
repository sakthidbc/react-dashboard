import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import apiCacheReducer from './slices/apiCacheSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    apiCache: apiCacheReducer,
  },
});

