import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import listingsReducer from './slices/listingsSlice';
import messagesReducer from './slices/messagesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        listings: listingsReducer,
        messages: messagesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 