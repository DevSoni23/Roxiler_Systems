import axios from 'axios';

// Automatically resolves to PC's local IP (e.g. 192.168.x.x) when accessed from a phone on Wi-Fi
const defaultApiUrl = typeof window !== 'undefined' && window.location.hostname
  ? `http://${window.location.hostname}:5000/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

// Runs before every request — attaches the JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;