import api from './axios';

export const validateCouponApi = (data) => api.post('/coupons/validate', data).then((r) => r.data);
