import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getAllSubscriptionsAPI = (page = 1, size = 10, params = '') =>
  axiosInstance.get(API.SUB_ALL(page, size, params));

export const getPendingSubscriptionsAPI = (page = 1, size = 10) =>
  axiosInstance.get(API.SUB_PENDING(page, size));

export const assignSubscriptionAPI = (data) =>
  axiosInstance.post(API.SUB_ASSIGN, data);

export const cancelSubscriptionAPI = (id) =>
  axiosInstance.post(API.SUB_CANCEL(id));

export const getMySubscriptionsAPI = (page = 1, size = 10) =>
  axiosInstance.get(API.SUB_MY(page, size));