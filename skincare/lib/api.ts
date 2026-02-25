import axios from 'axios';
import storage from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
