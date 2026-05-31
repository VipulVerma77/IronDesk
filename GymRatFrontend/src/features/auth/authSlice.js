import { createSlice } from '@reduxjs/toolkit';

const initialState = {       
  user:      null,
  token:     null,
  isLoading: false,
  error:     null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,             
  reducers: {
    setCredentials: (state, action) => {
      state.user  = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {   
      state.user  = null;
      state.token = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;

export const selectUser      = (state) => state.auth.user;
export const selectToken     = (state) => state.auth.token;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError     = (state) => state.auth.error;