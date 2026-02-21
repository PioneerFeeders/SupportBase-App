import axios from 'axios';

const API_BASE = 'https://support-base-production.up.railway.app/api/v1';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('agent');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const searchCustomers = (q) => api.get(`/customers/search?q=${encodeURIComponent(q)}`);
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const getCustomerOrders = (id, limit = 25) => api.get(`/customers/${id}/orders?limit=${limit}`);
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createReship = (id, data) => api.post(`/orders/${id}/reship`, data);
export const createRefund = (id, data) => api.post(`/orders/${id}/refund`, data);
export const getTickets = (params) => api.get('/tickets', { params });
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const addTicketMessage = (id, body) => api.post(`/tickets/${id}/messages`, { body });
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const getAnalyticsOverview = () => api.get('/analytics/overview');
export const getDoaByChannel = (w) => api.get(`/analytics/doa-by-channel?weeks=${w || 12}`);
export const getReshipCosts = (w) => api.get(`/analytics/reship-costs?weeks=${w || 12}`);
export const getRefundTotals = (w) => api.get(`/analytics/refund-totals?weeks=${w || 12}`);
export const updateAvailability = (v) => api.put('/auth/availability', { isAvailable: v });

export default api;
