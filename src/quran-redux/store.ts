import {combineReducers, configureStore} from '@reduxjs/toolkit';
import QuranReducer from './slice';
import {setupListeners} from '@reduxjs/toolkit/query';
import {quranBaseApi} from './quran-api';
import persistStore from 'redux-persist/es/persistStore';
import persistReducer from 'redux-persist/es/persistReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Don't persist API cache state
  blacklist: [quranBaseApi.reducerPath],
};

// Combine all reducers
const rootReducer = combineReducers({
  quran: QuranReducer,
  [quranBaseApi.reducerPath]: quranBaseApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(quranBaseApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
