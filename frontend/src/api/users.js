import api from './axios';

export const getWishlistApi = () => api.get('/users/wishlist').then((r) => r.data);
export const toggleWishlistApi = (productId) =>
  api.post(`/users/wishlist/${productId}`).then((r) => r.data);
