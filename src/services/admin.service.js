const { supabaseAdmin } = require('../config/supabase');

class AdminService {
  async getPendingTournaments() {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .select('*, organizer:profiles(username)')
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  }

  async approveTournament(id) {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async rejectTournament(id, message) {
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update({ status: 'rejected', rejection_reason: message })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async validateMatch(matchId, scoreA, scoreB) {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .update({ 
        status: 'finished', 
        score_a: scoreA, 
        score_b: scoreB,
        validated_by_admin: true
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new AdminService();
