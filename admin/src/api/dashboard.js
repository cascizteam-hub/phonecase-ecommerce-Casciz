import api from './axios';

export const getDashboardSummaryApi = () => api.get('/dashboard/summary').then((r) => r.data);
export const getSalesAnalyticsApi = (period) =>
  api.get('/dashboard/sales', { params: { period } }).then((r) => r.data);
export const getInventoryReportApi = () => api.get('/dashboard/inventory').then((r) => r.data);
