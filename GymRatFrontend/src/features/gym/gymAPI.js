import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getMyGymAPI = async () => {
  const response = await axiosInstance.get(API.GYM_ME);
  return response.data;
};

export const getGymBySlugAPI = async (slug) => {
  const response = await axiosInstance.get(API.GYM_SLUG(slug));
  return response.data;
};

export const updateGymAPI = async (data) => {
  const response = await axiosInstance.put(API.GYM_UPDATE, data);
  return response.data;
};

export const updateThemeAPI = async (theme) => {
  const response = await axiosInstance.put(API.GYM_THEME, { theme });
  return response.data;
};

export const deleteGymAPI = async () => {
  const response = await axiosInstance.delete(API.GYM_DELETE);
  return response.data;
};