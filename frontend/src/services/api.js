import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

export async function getHealth() {
  const response = await apiClient.get('/');
  return response.data;
}

export async function getLogs() {
  const response = await apiClient.get('/logs');
  return response.data;
}

export async function getAlerts() {
  const response = await apiClient.get('/alerts');
  return response.data;
}

export default apiClient;
