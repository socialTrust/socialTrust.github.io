import apiClient from './axios';
import { mockAuthAPI } from './mockApi';

// Mock 모드 여부 확인
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

export const authAPI = isMockMode ? mockAuthAPI : {
  register(data) {
    return apiClient.post('/auth/register', data);
  },
  login(data) {
    return apiClient.post('/auth/login', data);
  },
};
