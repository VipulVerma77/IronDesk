import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getAllPaymentsAPI = (page = 1, size = 10) =>
  axiosInstance.get(API.PAYMENT_ALL(page, size));

export const markPaymentPaidAPI = (paymentId) =>
  axiosInstance.post(API.PAYMENT_MARK_PAID, { paymentId });