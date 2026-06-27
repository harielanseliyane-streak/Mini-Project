// ─────────────────────────────────────────────────────────────
// Supabase Client – Initialization and Session Recovery
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing from your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auto-restore custom JWT session if present in localStorage
const savedSession = localStorage.getItem('mock_session');
if (savedSession) {
  try {
    const parsed = JSON.parse(savedSession);
    if (parsed?.session?.access_token) {
      supabase.auth.setSession({
        access_token: parsed.session.access_token,
        refresh_token: parsed.session.access_token
      }).then(({ error }) => {
        if (error) console.error('Error setting restored session:', error);
      }).catch(err => {
        console.error('Failed to restore Supabase session:', err);
      });
    }
  } catch (e) {
    console.error('Failed to parse saved session on startup:', e);
  }
}
