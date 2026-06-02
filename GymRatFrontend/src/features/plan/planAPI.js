import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getAllPlansAPI = () =>
  axiosInstance.get(API.PLAN_GET_ALL);

export const createPlanAPI = (data) =>
  axiosInstance.post(API.PLAN_CREATE, data);