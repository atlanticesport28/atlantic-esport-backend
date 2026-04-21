const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation with clear logs for Railway debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ CRITICAL: SUPABASE_URL or SUPABASE_ANON_KEY is missing!');
  console.error('The server will start, but database operations will fail.');
}

// Client for public/auth operations (scoped to user JWT)
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for bypass RLS and admin tasks
// 🔐 SECURITY WARNING: NEVER expose the serviceRoleKey in frontend code or public logs.
// This client should ONLY be used in backend services with strict role/permission checks.
const supabaseAdmin = (supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey))
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = { supabase, supabaseAdmin };
