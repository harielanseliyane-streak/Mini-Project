// ─────────────────────────────────────────────────────────────
// Supabase Client Stub – bypassed in favor of local mock DB
// ─────────────────────────────────────────────────────────────

export const supabase = {
  auth: {
    getSession: async () => {
      const saved = localStorage.getItem('mock_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { data: { session: parsed.session }, error: null };
        } catch (e) {
          return { data: { session: null }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback) => {
      // Provide a minimal subscription listener stub
      const handleStorageChange = (e) => {
        if (e.key === 'mock_session') {
          const val = e.newValue;
          if (val) {
            try {
              const parsed = JSON.parse(val);
              callback('SIGNED_IN', parsed.session);
            } catch (err) {}
          } else {
            callback('SIGNED_OUT', null);
          }
        }
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorageChange);
              }
            }
          }
        }
      };
    },
    signInWithPassword: async ({ email, password }) => {
      return { data: {}, error: new Error('Use mock API authentication') };
    },
    signUp: async ({ email, password }) => {
      return { data: {}, error: new Error('Use mock API authentication') };
    },
    signOut: async () => {
      return { error: null };
    }
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null })
      }),
      in: () => ({
        select: async () => ({ data: null, error: null })
      })
    })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};
