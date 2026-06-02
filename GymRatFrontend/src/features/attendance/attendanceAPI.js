import axiosInstance from '../../utils/axiosInstance';
import { API } from '../../constants/api';

export const checkInAPI = (memberId) =>
  axiosInstance.post(API.ATTENDANCE_CHECKIN, { memberId });

export const checkOutAPI = (attendanceId) =>
  axiosInstance.post(API.ATTENDANCE_CHECKOUT, { attendanceId });

export const getTodayAttendanceAPI = (page = 1, size = 10) =>
  axiosInstance.get(API.ATTENDANCE_TODAY(page, size));

export const getAttendanceByMemberAPI = (memberId, page = 1, size = 10) =>
  axiosInstance.get(API.ATTENDANCE_MEMBER(memberId, page, size));

export const getAttendanceByRangeAPI = (from, to, page = 1, size = 10) =>
  axiosInstance.get(API.ATTENDANCE_RANGE(from, to, page, size));