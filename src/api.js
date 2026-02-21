import axios from 'axios';

const API_BASE = 'https://support-base-production.up.railway.app/api/v1';

const client = axios.create({ baseURL: API_BASE });

// Attach auth token to every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
client.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('agent');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const login = (email, password) =>
  client.post('/auth/login', { email, password });

// ── Tickets ──
export const getTickets = (params = {}) =>
  client.get('/tickets', { params });

export const getTicketStats = () =>
  client.get('/tickets/stats');

export const getTicket = (id) =>
  client.get(`/tickets/${id}`);

export const updateTicket = (id, data) =>
  client.patch(`/tickets/${id}`, data);

export const createTicket = (data) =>
  client.post('/tickets', data);

export const getTicketMessages = (id) =>
  client.get(`/tickets/${id}/messages`);

export const sendMessage = (ticketId, data) =>
  client.post(`/tickets/${ticketId}/messages`, data);

// ── Customers ──
export const searchCustomers = (query) =>
  client.get('/customers/search', { params: { q: query } });

export const getCustomerOrders = (customerId) =>
  client.get(`/customers/${customerId}/orders`);

// ── Actions ──
export const createReship = (orderId, data) =>
  client.post(`/orders/${orderId}/reship`, data);

export const createRefund = (orderId, data) =>
  client.post(`/orders/${orderId}/refund`, data);

// ── SSE stream URL builder ──
export const getEventStreamUrl = () => {
  const token = localStorage.getItem('auth_token');
  return `${API_BASE}/events/stream?token=${encodeURIComponent(token)}`;
};

export default client;
