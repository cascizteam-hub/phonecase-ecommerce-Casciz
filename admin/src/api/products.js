import api from './axios';

export const getProductsApi = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProductApi = (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data);
export const createProductApi = (data) => api.post('/products', data).then((r) => r.data);
export const updateProductApi = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProductApi = (id) => api.delete(`/products/${id}`).then((r) => r.data);
