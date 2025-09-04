import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// إنشاء instance من axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لإضافة التوكن للطلبات
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع الاستجابات
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // إزالة التوكن من localStorage عند انتهاء صلاحيته
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// خدمات المصادقة
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// خدمات الخزائن
export const vaultService = {
  getAll: () => api.get('/vaults'),
  getById: (id) => api.get(`/vaults/${id}`),
  create: (data) => api.post('/vaults', data),
  update: (id, data) => api.put(`/vaults/${id}`, data),
  delete: (id) => api.delete(`/vaults/${id}`),
  getHierarchy: () => api.get('/vaults/hierarchy/tree'),
};

// خدمات المشاريع
export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getByVault: (vaultId) => api.get(`/projects/vault/${vaultId}`),
};

// خدمات التقارير المالية
export const reportService = {
  getAll: (params = {}) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  getStats: (params = {}) => api.get('/reports/stats/summary', { params }),
};

// خدمات المستخدمين
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.put(`/users/${id}/password`, data),
  getStats: () => api.get('/users/stats/summary'),
};

export default api;