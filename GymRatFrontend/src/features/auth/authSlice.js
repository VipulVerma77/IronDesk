import {createSlice} from "@reduxjs/toolkit";

const intialState = {
    user : null,
    token : null,
    isLoading : false,
    error : null
}

const authSlice = createSlice({
    name:"auth",
    intialState,
    reducers:{
        setCredentials :(state,action) =>{
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout : (state, token) => {
            state.user = null;
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

export const {setCredentials , logout, setLoading,setError} = authSlice.actions;

export default authSlice.reducers;

export const selectUser      = (state) => state.auth.user;
export const selectToken     = (state) => state.auth.token;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError     = (state) => state.auth.error;