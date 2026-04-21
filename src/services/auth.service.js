const { supabase } = require('../config/supabase');

class AuthService {
  async register(email, password, username, role = 'player', continent = null, country = null) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role,
          continent,
          country
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }
}

module.exports = new AuthService();
