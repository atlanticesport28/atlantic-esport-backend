const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for public/auth operations (scoped to user JWT)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypass RLS and admin tasks
// 🔐 SECURITY WARNING: NEVER expose the serviceRoleKey in frontend code or public logs.
// This client should ONLY be used in backend services with strict role/permission checks.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase, supabaseAdmin };
