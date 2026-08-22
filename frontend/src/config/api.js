import axios from 'axios';

// Base API instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Request interceptor to attach admin token or vault token
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('vault_admin_token');
  const vaultToken = sessionStorage.getItem('vault_access_token');

  // If path is under /admin, /siblings, or /recordings (admin management)
  if (config.url?.startsWith('/admin') || config.url?.startsWith('/siblings') || config.url?.startsWith('/recordings')) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else if (config.url?.startsWith('/access/vault') || config.url?.startsWith('/private')) {
    if (vaultToken) {
      config.headers.Authorization = `Bearer ${vaultToken}`;
    }
  }

  return config;
});

export default API;
