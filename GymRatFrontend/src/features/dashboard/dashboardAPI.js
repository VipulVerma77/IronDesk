import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getDashboardSummaryAPI = () =>
  axiosInstance.get(API.DASHBOARD_SUMMARY);