import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import moderatorReducer from './slices/moderatorSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        moderator: moderatorReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
