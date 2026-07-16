import api from './axios';

export const getCategoriesApi = () => api.get('/categories').then((r) => r.data);
