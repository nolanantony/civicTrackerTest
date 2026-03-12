import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const adminLogin = (data) => API.post('/auth/admin/login', data);
export const getMe = () => API.get('/auth/me');

// Complaints
export const getComplaints = (params) => API.get('/complaints', { params });
export const getComplaint = (id) => API.get(`/complaints/${id}`);
export const fileComplaint = (data) => API.post('/complaints', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const supportComplaint = (id) => API.post(`/complaints/${id}/support`);
export const getMyComplaints = () => API.get('/complaints/user/my');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminComplaints = (params) => API.get('/admin/complaints', { params });
export const updateComplaintStatus = (id, data) => API.patch(`/admin/complaints/${id}/status`, data);
export const deleteComplaint = (id) => API.delete(`/admin/complaints/${id}`);
export const getUsers = () => API.get('/admin/users');

export default API;
