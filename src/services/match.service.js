const { supabase } = require('../config/supabase');
const { getEmbedUrl } = require('../utils/stream');

class MatchService {
  async createMatch(matchData) {
    const { data, error } = await supabase
      .from('matches')
      .insert([{ ...matchData, status: 'upcoming' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async startMatch(id) {
    const { data, error } = await supabase
      .from('matches')
      .update({ status: 'live' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addLive(matchId, userId, streamUrl) {
    // Verify user is player_a (home player)
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('player_a, status')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) throw new Error('Match not found');
    if (match.player_a !== userId) throw new Error('Only the home player can add a live stream');
    
    const embedUrl = getEmbedUrl(streamUrl);

    const { data, error } = await supabase
      .from('matches')
      .update({ 
        live_url: streamUrl, 
        embed_url: embedUrl,
        status: 'live'
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async submitResult(matchId, userId, score, screenshotUrl) {
    // Insert proof
    const { data: proof, error: proofError } = await supabase
      .from('match_proofs')
      .insert([{ match_id: matchId, user_id: userId, score_submitted: score, screenshot_url: screenshotUrl }])
      .select()
      .single();

    if (proofError) throw proofError;

    // Check if both players submitted
    const { data: proofs, error: fetchError } = await supabase
      .from('match_proofs')
      .select('*')
      .eq('match_id', matchId);

    if (fetchError) throw fetchError;

    if (proofs.length === 2) {
      const p1 = proofs[0];
      const p2 = proofs[1];

      // Auto resolve logic
      // Assuming score is a string like "2-1" or similar, or we handle score_a/score_b logic
      // For simplicity, let's assume we validate if they agree on the outcome
      if (JSON.stringify(p1.score_submitted) === JSON.stringify(p2.score_submitted)) {
        // Scores match - Auto resolve
        const scoreObj = p1.score_submitted; // { score_a: X, score_b: Y }
        const winnerId = scoreObj.score_a > scoreObj.score_b ? match.player_a : match.player_b;

        await supabase
          .from('matches')
          .update({ 
            status: 'finished', 
            score_a: scoreObj.score_a, 
            score_b: scoreObj.score_b,
            winner_id: winnerId
          })
          .eq('id', matchId);
          
        // Trigger progression logic if it's a tournament match
        if (match.tournament_id) {
          // We'll call a progression method from TournamentService later or handle it here
          // For now, let's just emit or rely on the finished status
        }
      } else {
        // Mismatch - Mark disputed
        await supabase
          .from('matches')
          .update({ status: 'disputed' })
          .eq('id', matchId);
      }
    } else {
      // Only one submitted - Mark pending
      await supabase
        .from('matches')
        .update({ status: 'pending' })
        .eq('id', matchId);
    }

    return proof;
  }

  async getMatchById(id) {
    const { data, error } = await supabase
      .from('matches')
      .select('*, player_a:profiles!player_a(username), player_b:profiles!player_b(username)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async manualResolve(matchId, winnerId, scoreA, scoreB) {
    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'finished',
        winner_id: winnerId,
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

module.exports = new MatchService();
