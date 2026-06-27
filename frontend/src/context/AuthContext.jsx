// ─────────────────────────────────────────────────────────────
// Auth Context – Supabase JWT Custom Authentication Flow
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);   // profile row (with role)
  const [session, setSession] = useState(null);   // custom session
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('mock_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed.session);
        setUser(parsed.user);
      } catch (e) {
        console.error('Failed to parse saved session', e);
        localStorage.removeItem('mock_session');
      }
    }
    setLoading(false);
  }, []);

  // ── Login with Supabase custom verifier ─────────────────────
  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    setSession(res.data.session);
    setUser(res.data.user);
    return res;
  }, []);

  // ── Register with Supabase custom creator ──────────────────
  const signUp = useCallback(async (email, password, metadata) => {
    const res = await apiRegister({ email, password, role: metadata.role, ...metadata });
    setSession(res.session);
    setUser(res.user);
    return { data: { session: res.session, user: res.user }, error: null };
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    localStorage.removeItem('mock_session');
    setUser(null);
    setSession(null);
    
    // Clear session in supabase client
    await supabase.auth.signOut().catch(() => {});
    
    window.dispatchEvent(new Event('storage'));
  }, []);


  // ── Update local user state ───────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...updates } : prev;
      if (updated) {
        const savedSession = localStorage.getItem('mock_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            parsed.user = updated;
            parsed.session.user = updated;
            localStorage.setItem('mock_session', JSON.stringify(parsed));
          } catch (e) {}
        }
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      login, signUp, logout, updateUser,
      isAuthenticated: !!session,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

