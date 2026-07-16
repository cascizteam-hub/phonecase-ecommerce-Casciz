import api from './axios';

export const createOrderApi = (data) => api.post('/orders', data).then((r) => r.data);
export const getMyOrdersApi = () => api.get('/orders/my').then((r) => r.data);
export const getOrderApi = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const cancelOrderApi = (id) => api.put(`/orders/${id}/cancel`).then((r) => r.data);
