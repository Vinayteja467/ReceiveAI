import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
export const API_HOST = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = API_HOST ? `${API_HOST}/api/v1` : '/api/v1';

export const getMediaUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl.substring(1) : pathOrUrl;
  return API_HOST ? `${API_HOST}/${cleanPath}` : `/${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics').then(res => res.data),
};

export const suppliersApi = {
  list: () => api.get('/suppliers').then(res => res.data),
  get: (id) => api.get(`/suppliers/${id}`).then(res => res.data),
  create: (data) => api.post('/suppliers', data).then(res => res.data),
};

export const purchaseOrdersApi = {
  list: (params) => api.get('/purchase-orders', { params }).then(res => res.data),
  get: (id) => api.get(`/purchase-orders/${id}`).then(res => res.data),
  create: (data) => api.post('/purchase-orders', data).then(res => res.data),
};

export const productsApi = {
  list: (params) => api.get('/products', { params }).then(res => res.data),
  get: (id) => api.get(`/products/${id}`).then(res => res.data),
  create: (data) => api.post('/products', data).then(res => res.data),
};

export const inspectionsApi = {
  list: (params) => api.get('/inspections', { params }).then(res => res.data),
  get: (id) => api.get(`/inspections/${id}`).then(res => res.data),
  create: (data) => api.post('/inspections', data).then(res => res.data),
  update: (id, data) => api.put(`/inspections/${id}`, data).then(res => res.data),
  updateItem: (id, itemId, data) => api.put(`/inspections/${id}/items/${itemId}`, data).then(res => res.data),
  finalize: (id, data) => api.post(`/inspections/${id}/finalize`, data).then(res => res.data),
  runAiInspection: (id) => api.post(`/inspections/${id}/ai-inspect`).then(res => res.data),
};

export const exceptionsApi = {
  list: (params) => api.get('/exceptions', { params }).then(res => res.data),
  get: (id) => api.get(`/exceptions/${id}`).then(res => res.data),
  create: (data) => api.post('/exceptions', data).then(res => res.data),
  update: (id, data) => api.put(`/exceptions/${id}`, data).then(res => res.data),
  requestMoreEvidence: (id, data) => api.post(`/exceptions/${id}/request-more-evidence`, data).then(res => res.data),
  markManualReview: (id, data) => api.post(`/exceptions/${id}/mark-manual-review`, data).then(res => res.data),
  resolve: (id, data) => api.post(`/exceptions/${id}/resolve`, data).then(res => res.data),
};

export const evidenceApi = {
  list: (params) => api.get('/evidence', { params }).then(res => res.data),
  upload: (formData) => api.post('/evidence/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  delete: (id) => api.delete(`/evidence/${id}`).then(res => res.data),
  record: (data) => api.post('/evidence/record', data).then(res => res.data),
};

export const settingsApi = {
  get: () => api.get('/settings').then(res => res.data),
  update: (data) => api.put('/settings', data).then(res => res.data),
};

export default api;
