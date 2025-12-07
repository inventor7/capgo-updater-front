import { configureStore } from "@reduxjs/toolkit";

// Create the store with an initial state that might be expected by Recharts
export const store = configureStore({
  reducer: {
    // Add reducers here if needed
  },
  // Provide an initial state that includes properties that libraries like Recharts might expect
  preloadedState: {},
  devTools: import.meta.env.MODE !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          // Add any other actions that might not be serializable
        ],
        ignoredPaths: [
          // Add any paths that might contain non-serializable values
        ],
      },
    }),
});

// Export the RootState type based on the store
export type RootState = ReturnType<typeof store.getState>;

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
