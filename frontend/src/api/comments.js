import apiClient from './axios';

export const commentsAPI = {
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
