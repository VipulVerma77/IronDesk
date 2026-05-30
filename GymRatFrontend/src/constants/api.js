const BASE_URL = 'http://localhost:5000/api';

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
};