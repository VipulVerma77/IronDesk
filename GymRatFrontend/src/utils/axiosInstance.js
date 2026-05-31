import axios from "axios";
import store from "../app/store";
import { logout, setCredentials } from "../features/auth/authSlice";

const axiosInstance = axios.create({
    baseUrl: "http://localhost:5006/api",
    withCredentials: true,
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post('http://localhost:5000/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );
                const newToken = response.data.data.accessToken;

                store.dispatch(setCredentials({
                    user: store.getState().auth.user,
                    token: newToken,
                }));
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refresherror) {
                store.dispatch(logout());
                return Promise.reject(refresherror);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

// What this does:
// Every API call automatically:

// Attaches the access token from Redux to the request header
// If it gets a 401 back — silently calls /api/auth/refresh using the HttpOnly cookie
// Gets a new access token, saves it to Redux
// Retries the original failed request — user never notices
// If refresh also fails — logs the user out