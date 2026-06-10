const BASE_URL = 'http://localhost:5006/api';

export const API = {
  // Auth
  LOGIN:    `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  REFRESH:  `${BASE_URL}/auth/refresh`,
  LOGOUT:   `${BASE_URL}/auth/logout`,
  PROFILE:  `${BASE_URL}/auth/profile`,

  // Gym
  GYM_REGISTER: `${BASE_URL}/gym/register`,
  GYM_ME:       `${BASE_URL}/gym/me`,
  GYM_UPDATE:   `${BASE_URL}/gym/update`,
  GYM_SLUG:     (slug) => `${BASE_URL}/gym/public/${slug}`,
  GYM_DELETE:   `${BASE_URL}/gym/delete`,
  GYM_UPDATE_THEME: `${BASE_URL}/gym/update-theme`,

  // Dashboard
  DASHBOARD_SUMMARY: `${BASE_URL}/dashboard/summary`,

  // Members
  MEMBER_ADD:     `${BASE_URL}/member/member`,
  MEMBER_GET_ALL: (page, size) => `${BASE_URL}/member/members?pageNumber=${page}&pageSize=${size}`,

  // Membership Plans
  PLAN_CREATE:  `${BASE_URL}/membershipplan`,
  PLAN_GET_ALL: `${BASE_URL}/membershipplan`,

  // Subscriptions
  SUB_ASSIGN:  `${BASE_URL}/subscription/admin/assign`,
  SUB_ALL:     (page, size, params = '') => `${BASE_URL}/subscription/admin/all?pageNumber=${page}&pageSize=${size}${params}`,
  SUB_PENDING: (page, size) => `${BASE_URL}/subscription/admin/pending?pageNumber=${page}&pageSize=${size}`,
  SUB_CANCEL:  (id) => `${BASE_URL}/subscription/admin/cancel/${id}`,
  SUB_MY:      (page, size) => `${BASE_URL}/subscription/my?pageNumber=${page}&pageSize=${size}`,

  // Payments
  PAYMENT_MARK_PAID: `${BASE_URL}/payment/mark-paid`,
  PAYMENT_ALL:       (page, size) => `${BASE_URL}/payment?pageNumber=${page}&pageSize=${size}`,

  // Attendance
  ATTENDANCE_CHECKIN:  `${BASE_URL}/attendance/checkin`,
  ATTENDANCE_CHECKOUT: `${BASE_URL}/attendance/checkout`,
  ATTENDANCE_TODAY:    (page, size) => `${BASE_URL}/attendance/today?pageNumber=${page}&pageSize=${size}`,
  ATTENDANCE_MEMBER:   (id, page, size) => `${BASE_URL}/attendance/member/${id}?pageNumber=${page}&pageSize=${size}`,
  ATTENDANCE_RANGE:    (from, to, page, size) => `${BASE_URL}/attendance/range?fromDate=${from}&toDate=${to}&pageNumber=${page}&pageSize=${size}`,

  SUB_PUBLIC: `${BASE_URL}/subscription/public/subscribe`,

};