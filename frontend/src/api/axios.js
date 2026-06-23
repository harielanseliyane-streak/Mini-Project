import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
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
