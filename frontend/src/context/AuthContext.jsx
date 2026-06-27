// ─────────────────────────────────────────────────────────────
// Auth Context – Supabase Auth (replaces JWT/axios-based auth)
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);   // profile row (with role)
  const [session, setSession] = useState(null);   // supabase session
  const [loading, setLoading] = useState(true);

  // Load profile row for a given auth user id
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) { setUser(null); return; }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (data) setUser({ ...data, email: authUser.email });
  }, []);

  // Bootstrap: restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Login with Supabase Auth ───────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  // ── Register with Supabase Auth ───────────────────────────
  const signUp = useCallback(async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  // ── Update local user state ───────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
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
