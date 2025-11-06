import apiClient from './axios';
import { mockPostsAPI } from './mockApi';

// Mock 모드 여부 확인
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

export const postsAPI = isMockMode ? mockPostsAPI : {
  getList(page = 1, limit = 20) {
    return apiClient.get('/posts', { params: { page, limit } });
  },
  getDetail(id) {
    return apiClient.get(`/posts/${id}`);
  },
  create(data) {
    return apiClient.post('/posts', data);
  },
  update(id, data) {
    return apiClient.put(`/posts/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/posts/${id}`);
  },
  search(keyword, page = 1, limit = 20) {
    return apiClient.get('/search', { params: { q: keyword, page, limit } });
  },
};
