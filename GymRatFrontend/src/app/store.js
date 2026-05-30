import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import gymReducer from '../features/gym/gymSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    gym: gymReducer,
  },
});

export default store;