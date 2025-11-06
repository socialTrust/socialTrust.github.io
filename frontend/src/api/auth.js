import apiClient from './axios';

export const authAPI = {
  register(data) {
    return apiClient.post('/auth/register', data);
  },
  login(data) {
    return apiClient.post('/auth/login', data);
  },
};
