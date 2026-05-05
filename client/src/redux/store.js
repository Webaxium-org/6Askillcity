import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";

import loadingReducer from "./loadingSlice";
import alertReducer from "./alertSlice";
import userReducer from "./userSlice";
import notificationReducer from "./notificationSlice";

const storage = createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
};

const reducer = combineReducers({
  loading: loadingReducer,
  alert: alertReducer,
  user: userReducer,
  notifications: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/FLUSH",
        ],
      },
    }),
});

export const persistor = persistStore(store);
