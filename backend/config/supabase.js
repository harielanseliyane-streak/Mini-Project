// ─────────────────────────────────────────────────────────────
// Supabase Client Configuration
// Used for Storage operations (file uploads)
// ─────────────────────────────────────────────────────────────
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl         = process.env.SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseServiceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. File uploads will not function.');
}

// Use the service role key on the server side so we can write to storage
// without being blocked by Row Level Security policies
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
});

module.exports = supabase;
