import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pnptv.accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pnptv.accessToken');
      localStorage.removeItem('pnptv.expiresAt');
    }
    return Promise.reject(error);
  }
);
