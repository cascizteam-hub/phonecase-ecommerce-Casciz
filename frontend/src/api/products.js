import api from './axios';

export const getProductsApi = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProductApi = (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data);
export const getFilterMetaApi = () => api.get('/products/filters/meta').then((r) => r.data);
export const createReviewApi = (productId, data) =>
  api.post(`/products/${productId}/reviews`, data).then((r) => r.data);
