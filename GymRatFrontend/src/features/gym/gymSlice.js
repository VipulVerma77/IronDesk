import { createSlice } from "@reduxjs/toolkit";

const intialState = {
    gym : null,
    publicGym : null,
    isLoading: false,
    error: null
};

const gymSlice = createSlice({
    name: "gym",
    initialState,
    reducers : {
        setGym : (state,action) => {
            state.gym = action.payload;
        },
        setPublicGym: (state,action) => {
            state.publicGym = action.payload;
        },
        clearGym : (state,action) => {
            state.gym = null;
            state.publicGym = null;
        },
        setLoading:(state, action) => {
            state.isLoading = action.payload;
        },
        setError:(state,payload) => {
            state.error = action.payload;
        },
    },
});

export const {setGym,setPublicGym,clearGym,setLoading,setError} = gymSlice.actions;

export default  gymSlice.reducer;

export const selectGym       = (state) => state.gym.gym;
export const selectPublicGym = (state) => state.gym.publicGym;
export const selectIsLoading = (state) => state.gym.isLoading;
export const selectError     = (state) => state.gym.error;  