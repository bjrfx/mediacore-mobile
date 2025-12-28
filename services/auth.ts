import { removeToken, saveToken } from '@/utils/storage';
import api from './api';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      await saveToken('accessToken', accessToken);
      await saveToken('refreshToken', refreshToken);
      return user;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  register: async (email: string, password: string, displayName: string) => {
    const response = await api.post('/auth/register', { email, password, displayName });
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await api.post<AuthResponse>('/auth/google', { googleToken: idToken });
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      await saveToken('accessToken', accessToken);
      await saveToken('refreshToken', refreshToken);
      return user;
    }
    throw new Error(response.data.message || 'Google login failed');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await removeToken('accessToken');
      await removeToken('refreshToken');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      // Token might be invalid or expired
    }
    return null;
  },
};
