import api from './axios';

export const getAllOrdersApi = (params) => api.get('/orders', { params }).then((r) => r.data);
export const getOrderApi = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatusApi = (id, status) =>
  api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
