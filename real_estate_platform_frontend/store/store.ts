import { configureStore } from '@reduxjs/toolkit';
import { clientsApi } from '@/services/clientsApi';
import { realtorsApi } from '@/services/realtorsApi';
import { propertiesApi } from '@/services/propertiesApi';

export const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
    [realtorsApi.reducerPath]: realtorsApi.reducer,
    [propertiesApi.reducerPath]: propertiesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      clientsApi.middleware,
      realtorsApi.middleware,
      propertiesApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
