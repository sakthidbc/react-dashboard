import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cache: {},
  loading: {},
  timestamps: {},
  cacheDuration: 5 * 60 * 1000, // 5 minutes default
};

const apiCacheSlice = createSlice({
  name: 'apiCache',
  initialState,
  reducers: {
    setCache: (state, action) => {
      const { key, data, duration } = action.payload;
      state.cache[key] = data;
      state.timestamps[key] = Date.now();
      if (duration) {
        state.cacheDuration = duration;
      }
    },
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      if (isLoading) {
        state.loading[key] = true;
      } else {
        delete state.loading[key];
      }
    },
    clearCache: (state, action) => {
      if (action.payload) {
        // Clear specific cache key
        delete state.cache[action.payload];
        delete state.timestamps[action.payload];
      } else {
        // Clear all cache
        state.cache = {};
        state.timestamps = {};
      }
    },
    invalidateCache: (state, action) => {
      // Mark cache as invalid (expired)
      if (action.payload) {
        delete state.timestamps[action.payload];
      } else {
        state.timestamps = {};
      }
    },
  },
});

export const { setCache, setLoading, clearCache, invalidateCache } = apiCacheSlice.actions;

// Selectors
export const getCachedData = (key) => (state) => {
  const cached = state.apiCache.cache[key];
  const timestamp = state.apiCache.timestamps[key];
  const duration = state.apiCache.cacheDuration;
  
  if (!cached || !timestamp) return null;
  
  // Check if cache is expired
  if (Date.now() - timestamp > duration) {
    return null;
  }
  
  return cached;
};

export const isLoading = (key) => (state) => {
  return !!state.apiCache.loading[key];
};

export default apiCacheSlice.reducer;

