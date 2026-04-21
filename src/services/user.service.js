const { supabase } = require('../config/supabase');

class UserService {
  async getUserById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLeaderboard(country) {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('points', { ascending: false });

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

module.exports = new UserService();
