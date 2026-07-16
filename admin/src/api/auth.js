import api from './axios';

export const loginApi = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getMeApi = () => api.get('/auth/me').then((r) => r.data);
export const logoutApi = () => api.post('/auth/logout').then((r) => r.data);
export const changePasswordApi = (data) => api.put('/auth/change-password', data).then((r) => r.data);
