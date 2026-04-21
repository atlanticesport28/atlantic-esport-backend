const { supabase } = require('../config/supabase');
const { success, error } = require('../utils/response');

class LiveController {
  async getAllLive(req, res) {
    try {
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select('*, player_a:profiles!player_a(username), player_b:profiles!player_b(username), tournament:tournaments(name)')
        .eq('status', 'live');

      if (fetchError) throw fetchError;
      success(res, data);
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new LiveController();
