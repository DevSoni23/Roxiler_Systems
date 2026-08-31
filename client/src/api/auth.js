import api from './axios';

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const changePassword = (data) => api.put('/auth/change-password', data);