import api from './axios';

export const getInstagramFeedApi = () => api.get('/instagram/feed').then((r) => r.data);
