import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the deployed backend.
// In local dev it falls back to '/api' which is proxied by vite.config.js.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor – handle 401 globally ─────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('infohub_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
