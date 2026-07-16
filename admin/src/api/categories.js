import api from './axios';

export const getCategoriesApi = () => api.get('/categories').then((r) => r.data);
export const createCategoryApi = (data) => api.post('/categories', data).then((r) => r.data);
export const updateCategoryApi = (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data);
export const deleteCategoryApi = (id) => api.delete(`/categories/${id}`).then((r) => r.data);
