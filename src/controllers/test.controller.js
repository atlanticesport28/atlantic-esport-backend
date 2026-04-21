const { supabase } = require('../config/supabase');
const { success, error } = require('../utils/response');

class TestController {
  async testConnection(req, res) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Check your environment variables.');
      }

      // Perform a simple health check query on Supabase
      const { data, error: dbError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (dbError) throw dbError;

      success(res, {
        connection: 'Connected',
        database: 'Supabase/PostgreSQL',
        userCount: count,
        message: 'Backend is stable and connected to Supabase'
      }, 'Test successful');
    } catch (err) {
      console.error('❌ Supabase Connection Error:', err.message);
      error(res, `Supabase connection failed: ${err.message}`, 503);
    }
  }

  async testCrud(req, res) {
    try {
      // Example Insert & Select for demonstration
      const testUsername = `testuser_${Date.now()}`;
      
      // Note: This requires the profiles table to exist
      // We use a dummy ID (UUID) for testing purposes if auth is bypassed
      // But usually, we'd test on a dedicated 'test' table
      success(res, {
        message: 'CRUD test logic ready',
        tip: 'Ensure schema.sql is executed in Supabase SQL Editor'
      });
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new TestController();
