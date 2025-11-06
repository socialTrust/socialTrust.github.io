import { defineStore } from 'pinia';
import { authAPI } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async register(userData) {
      try {
        const response = await authAPI.register(userData);
        this.setAuth(response.data.token, response.data.user);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async login(credentials) {
      try {
        const response = await authAPI.login(credentials);
        this.setAuth(response.data.token, response.data.user);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
  },
});
