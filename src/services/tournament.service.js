const { supabase } = require('../config/supabase');

class TournamentService {
  async createTournament(tournamentData) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{ ...tournamentData, status: 'draft' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTournament(id, updates, organizerId) {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .eq('organizer_id', organizerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async submitForApproval(id, organizerId) {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ status: 'pending' })
      .eq('id', id)
      .eq('organizer_id', organizerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async joinTournament(tournamentId, userId) {
    // Check if tournament exists and is public
    const { data: tournament, error: tError } = await supabase
      .from('tournaments')
      .select('max_players, status')
      .eq('id', tournamentId)
      .single();

    if (tError || !tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'approved') throw new Error('Tournament is not open for joining');

    // Check player count
    const { count, error: countError } = await supabase
      .from('tournament_players')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId);

    if (countError) throw countError;
    if (count >= tournament.max_players) throw new Error('Tournament is full');

    // Join
    const { data, error } = await supabase
      .from('tournament_players')
      .insert([{ tournament_id: tournamentId, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTournaments(filters = {}) {
    let query = supabase.from('tournaments').select('*');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getTournamentById(id) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, organizer:profiles(username)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getMyTournaments(userId) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('organizer_id', userId);

    if (error) throw error;
    return data;
  }

  async startTournament(id, organizerId) {
    // 1. Get tournament and players
    const { data: tournament, error: tError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .eq('organizer_id', organizerId)
      .single();

    if (tError || !tournament) throw new Error('Tournament not found or unauthorized');
    if (tournament.status !== 'approved') throw new Error('Tournament must be approved to start');

    const { data: players, error: pError } = await supabase
      .from('tournament_players')
      .select('user_id')
      .eq('tournament_id', id);

    if (pError) throw pError;
    if (players.length < 2) throw new Error('Not enough players to start');

    // 2. Generate first round matches (Knockout)
    const shuffledPlayers = players.sort(() => Math.random() - 0.5);
    const matches = [];
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (shuffledPlayers[i+1]) {
        matches.push({
          tournament_id: id,
          player_a: shuffledPlayers[i].user_id,
          player_b: shuffledPlayers[i+1].user_id,
          round: 1,
          status: 'upcoming'
        });
      } else {
        // Bye (if odd number of players, though rules say 8, 16, 32)
        // For simplicity, we assume even power of 2
      }
    }

    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select();

    if (error) throw error;

    // Update tournament status
    await supabase.from('tournaments').update({ status: 'ongoing' }).eq('id', id);

    return data;
  }

  async handleMatchFinished(matchId) {
    // Get match info
    const { data: match, error: mError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (mError || !match || !match.winner_id) return;

    // Check if there's a next match to fill
    // In a knockout, we need to find the "parent" match or the next slot
    // This requires a more complex seeding logic, but for a simplified version:
    // We look for a match in the next round that is missing a player
    
    const nextRound = match.round + 1;
    
    // Find or create a match in the next round
    const { data: potentialMatch, error: pmError } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', match.tournament_id)
      .eq('round', nextRound)
      .filter('player_a', 'is', null)
      .or(`player_b.is.null`)
      .limit(1)
      .single();

    if (pmError || !potentialMatch) {
      // Create new match for the next round
      await supabase.from('matches').insert([{
        tournament_id: match.tournament_id,
        player_a: match.winner_id,
        round: nextRound,
        status: 'pending'
      }]);
    } else {
      // Fill the existing match slot
      const updateData = potentialMatch.player_a ? { player_b: match.winner_id, status: 'upcoming' } : { player_a: match.winner_id };
      await supabase.from('matches').update(updateData).eq('id', potentialMatch.id);
    }
  }
}

module.exports = new TournamentService();
