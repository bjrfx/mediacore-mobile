import { getToken, removeToken, saveToken } from '@/utils/storage';
import axios from 'axios';

const API_URL = 'https://mediacoreapi-sql.masakalirestrobar.ca';
const API_KEY = 'mc_3f177f8a673446ba8ee152728d877b00';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

export const publicApi = {
  getFeed: async (params?: { type?: 'video' | 'audio'; language?: string; limit?: number; orderBy?: string; order?: 'asc' | 'desc' }) => {
    const response = await api.get('/api/feed', { params });
    return response.data;
  },
  getMedia: async (id: string) => {
    const response = await api.get(`/api/media/${id}`);
    return response.data;
  },
  getArtists: async () => {
    const response = await api.get('/api/artists');
    return response.data;
  },
  getArtist: async (id: string) => {
    const response = await api.get(`/api/artists/${id}`);
    return response.data;
  },
  getAlbums: async (params?: { artistId?: string }) => {
    const response = await api.get('/api/albums', { params });
    return response.data;
  },
  getAlbum: async (id: string) => {
    const response = await api.get(`/api/albums/${id}`);
    return response.data;
  },
  getAlbumMedia: async (id: string) => {
    const response = await api.get(`/api/albums/${id}/media`);
    return response.data;
  },
};


api.interceptors.request.use(
  async (config) => {
    const token = await getToken('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getToken('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await saveToken('accessToken', accessToken);
        await saveToken('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, we should logout the user
        await removeToken('accessToken');
        await removeToken('refreshToken');
        // You might want to trigger a global logout action here or redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
