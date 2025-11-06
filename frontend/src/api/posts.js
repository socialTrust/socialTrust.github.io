import apiClient from './axios';

export const postsAPI = {
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
