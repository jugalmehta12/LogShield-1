import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
});

/**
 * Attach the JWT Bearer token to every outgoing request when it exists
 * in localStorage. The interceptor runs just before the request is sent
 * so it always picks up the freshest token value.
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('logshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
