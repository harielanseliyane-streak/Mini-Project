// ─────────────────────────────────────────────────────────────
// Auth Context – global user state + JWT management
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem('infohub_token') || null);
  const [loading, setLoading] = useState(true);

  // ── Persist token in axios headers ───────────────────────
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('infohub_token', token);
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('infohub_token');
    }
  }, [token]);

  // ── Load user from token on mount ────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await axiosInstance.get('/auth/me');
        if (data.success) setUser(data.user);
        else logout();
      } catch { logout(); }
      finally { setLoading(false); }
    };
    loadUser();
  }, []);

  const login = useCallback((userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
