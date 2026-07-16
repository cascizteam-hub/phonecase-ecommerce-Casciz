import api from './axios';

export const createRazorpayOrderApi = (orderId) =>
  api.post('/payments/razorpay/order', { orderId }).then((r) => r.data);

export const verifyRazorpayPaymentApi = (data) =>
  api.post('/payments/razorpay/verify', data).then((r) => r.data);
