import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';


export const loginAPI = async (credentials) => {
  const response = await axiosInstance.post(API.LOGIN, credentials);
  return response.data;
};

export const registerAPI = async (data) => {
  const response = await axiosInstance.post(API.REGISTER, data);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axiosInstance.post(API.LOGOUT);
  return response.data;
};

export const getProfileAPI = async () => {
  const response = await axiosInstance.get(API.PROFILE);
  return response.data;
};

export const registerGymAPI = async (data) => {
  console.log(data);
  const response = await axiosInstance.post(API.GYM_REGISTER, data);
  return response.data;
};