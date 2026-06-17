import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Unwrap standardized API response format { success, message, data }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      const { success, message, data } = response.data;
      response.data = data || {};
      if (message && typeof response.data === 'object') {
        response.data._serverMessage = message;
        response.data._success = success;
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url;
      // Do not redirect if it's an explicit login/register/forgot/reset API request
      if (
        url &&
        !url.includes('/auth/login') &&
        !url.includes('/auth/register') &&
        !url.includes('/auth/forgot-password') &&
        !url.includes('/auth/reset-password')
      ) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
