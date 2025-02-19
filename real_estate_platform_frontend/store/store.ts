import { configureStore } from '@reduxjs/toolkit';
import { clientsApi } from '@/services/clientsApi';
import { realtorsApi } from '@/services/realtorsApi';

export const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
    [realtorsApi.reducerPath]: realtorsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(clientsApi.middleware, realtorsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
