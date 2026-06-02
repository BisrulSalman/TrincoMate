import axios from 'axios';
import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// List of endpoints that don't require authentication
const PROTECTED_ENDPOINTS = [
  '/services/',
  '/bookings/',
  '/gallery/',
  '/auth/owners',
  '/auth/users',
  '/auth/role',
];

// Check if endpoint requires authentication
const requiresAuth = (url) => {
  return PROTECTED_ENDPOINTS.some(endpoint => url?.includes(endpoint));
};

// Attach authentication token to protected requests only
api.interceptors.request.use(async (config) => {
  // Only attach token to protected endpoints
  const url = config.url || '';
  
  if (!requiresAuth(url)) {
    // Public endpoints - don't add auth header
    return config;
  }

  // Try to attach stored token first (fastest)
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
    return config;
  }

  // Fall back to Firebase token if available
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.debug('Could not get Firebase token:', err.message);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('API 401 Unauthorized — check credentials or token');
    }
    if (error.response?.status === 403) {
      console.warn('API 403 Forbidden — insufficient permissions');
    }
    return Promise.reject(error);
  }
);

export default api;
