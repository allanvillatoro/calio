import axios from 'axios';

import { getStoredAuthToken } from '@/lib/auth-client';

export const productsApi = axios.create({
  baseURL: '/api/products',
  params: {},
});

productsApi.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
