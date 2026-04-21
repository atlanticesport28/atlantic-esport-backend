const { supabase } = require('../config/supabase');

class ChatService {
  async sendMessage(matchId, userId, message) {
    // Check if match is still active
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('status')
      .eq('id', matchId)
      .single();

    if (matchError || !match) throw new Error('Match not found');
    if (['finished', 'disputed'].includes(match.status)) {
      throw new Error('Chat is disabled for completed or disputed matches');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ match_id: matchId, user_id: userId, message }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(matchId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, user:profiles(username, avatar_url)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}

module.exports = new ChatService();
