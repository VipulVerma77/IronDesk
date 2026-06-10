import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getGymBySlugAPI = (slug) =>
  axiosInstance.get(API.GYM_SLUG(slug));