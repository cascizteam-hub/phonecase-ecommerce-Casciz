import api from './axios';

export const getUsersApi = (params) => api.get('/users', { params }).then((r) => r.data);
export const getUserApi = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const updateUserApi = (id, data) => api.put(`/users/${id}`, data).then((r) => r.data);
export const deleteUserApi = (id) => api.delete(`/users/${id}`).then((r) => r.data);
