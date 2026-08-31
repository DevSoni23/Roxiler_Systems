import api from './axios';

export const addUser = (data) => api.post('/admin/users', data);
export const getUsers = (params) => api.get('/admin/users', { params });
export const getDashboardStats = () => api.get('/admin/dashboard');