import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),

  // Therapists
  getTherapists: (params?: any) => api.get('/admin/therapists', { params }),

  // Clients
  getClients: (params?: any) => api.get('/admin/clients', { params }),
  getClientById: (id: string) => api.get(`/admin/clients/${id}`),

  // Payments
  getPayments: (params?: any) => api.get('/admin/payments', { params }),

  // Pricing
  getPricing: () => api.get('/admin/pricing'),
  createPricing: (data: any) => api.post('/admin/pricing', data),
  updatePricing: (tier: string, data: any) => api.put(`/admin/pricing/${tier}`, data),
  deletePricing: (tier: string) => api.delete(`/admin/pricing/${tier}`),

  // Payment Split
  getPaymentSplit: () => api.get('/admin/payment-split'),
  updatePaymentSplit: (data: any) => api.put('/admin/payment-split', data),

  // Rate Caps
  getRateCaps: () => api.get('/admin/rate-caps'),
  updateRateCaps: (data: any) => api.put('/admin/rate-caps', data),

  // Sessions
  getSessions: (params?: any) => api.get('/admin/sessions', { params }),
  bulkSessionAction: (sessionIds: string[], action: string) =>
    api.post('/admin/sessions/bulk-action', { sessionIds, action }),

  // Reports
  getReports: (params?: any) => api.get('/admin/reports', { params }),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),

  // User Management
  suspendUser: (userId: string) => api.post(`/admin/users/${userId}/suspend`),
  activateUser: (userId: string) => api.post(`/admin/users/${userId}/activate`),
  bulkUserAction: (userIds: string[], action: string) =>
    api.post('/admin/users/bulk-action', { userIds, action }),

  // Therapist Credentials
  updateTherapistCredentials: (therapistId: string, credentials: string) =>
    api.put(`/admin/therapists/${therapistId}/credentials`, { credentials }),
  bulkUpdateCredentials: (therapistIds: string[], credentials: string) =>
    api.put('/admin/therapists/credentials/bulk', { therapistIds, credentials }),

  // Therapist Earnings
  getTherapistEarnings: (therapistId: string, params?: any) =>
    api.get(`/admin/therapists/${therapistId}/earnings`, { params }),
  getAllTherapistsEarnings: (params?: any) =>
    api.get('/admin/therapists/earnings', { params }),

  // Therapist Status & Compliance
  updateTherapistStatus: (therapistId: string, status: string, reason?: string) =>
    api.put(`/admin/therapists/${therapistId}/status`, { status, reason }),
  updateTherapistSupervising: (therapistId: string, canSupervise: boolean) =>
    api.put(`/admin/therapists/${therapistId}/supervising`, { canSupervise }),
  verifyTherapistCompliance: (therapistId: string, documentType: string, verified: boolean, notes?: string, credentialId?: string) =>
    api.put(`/admin/therapists/${therapistId}/verify-compliance`, { documentType, verified, notes, credentialId }),
  getTherapistActivity: (therapistId: string, params?: any) =>
    api.get(`/admin/therapists/${therapistId}/activity`, { params }),
  getIncompleteTherapistProfiles: () =>
    api.get('/admin/therapists/incomplete'),

  // Platform Stats
  getPlatformStats: () => api.get('/admin/platform-stats'),
  updatePlatformStats: (data: any) => api.put('/admin/platform-stats', data),
};

// Message/Support API
export const messageAPI = {
  getSupportConversations: () => api.get('/messages/admin/support-conversations'),
  getAdminConversation: (userId: string) => api.get(`/messages/admin/conversation/${userId}`),
  sendAdminReply: (userId: string, content: string, formData?: FormData) => {
    if (formData) {
      return api.post('/messages/admin/reply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/messages/admin/reply', { userId, content });
  },
};

// Resource API
export const resourceAPI = {
  getAll: (params?: any) => api.get('/resources', { params }),
  approve: (id: string) => api.put(`/resources/${id}/approve`),
  create: (formData: FormData) => api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => api.delete(`/resources/${id}`),
};

export default api;

