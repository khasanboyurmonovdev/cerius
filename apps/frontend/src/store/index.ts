import { configureStore } from '@reduxjs/toolkit';

import { ceriusApi } from '../services/api.js';

/**
 * Root store. Only the RTK Query reducer is wired today; domain slices
 * (auth, profile, mealPlans, groceries, subscription, ui) mount here per docs/05.
 */
export const store = configureStore({
  reducer: {
    [ceriusApi.reducerPath]: ceriusApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ceriusApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
