import apiClient from './axios';
import { mockCommentsAPI } from './mockApi';

// Mock 모드 여부 확인
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

export const commentsAPI = isMockMode ? mockCommentsAPI : {
  getList(postId) {
    return apiClient.get(`/comments/post/${postId}`);
  },
  create(data) {
    return apiClient.post('/comments', data);
  },
  update(id, data) {
    return apiClient.put(`/comments/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/comments/${id}`);
  },
};
