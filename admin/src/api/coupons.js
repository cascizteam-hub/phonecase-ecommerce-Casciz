import api from './axios';

export const getCouponsApi = () => api.get('/coupons').then((r) => r.data);
export const createCouponApi = (data) => api.post('/coupons', data).then((r) => r.data);
export const updateCouponApi = (id, data) => api.put(`/coupons/${id}`, data).then((r) => r.data);
export const deleteCouponApi = (id) => api.delete(`/coupons/${id}`).then((r) => r.data);
