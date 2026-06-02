import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const getAllMembersAPI = (page = 1, size = 10) =>
  axiosInstance.get(API.MEMBER_GET_ALL(page, size));

export const addMemberAPI = (data) =>
  axiosInstance.post(API.MEMBER_ADD, data);