const { supabase } = require('../config/supabase');

class TeamService {
  async createTeam(name, tag, captainId) {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name, tag, captain_id: captainId }])
      .select()
      .single();

    if (error) throw error;

    // Add captain as member
    await supabase
      .from('team_members')
      .insert([{ team_id: data.id, user_id: captainId, role: 'captain' }]);

    return data;
  }

  async joinTeam(teamId, userId) {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{ team_id: teamId, user_id: userId, role: 'member' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createTeamBattle(teamAId, teamBId, tournamentId) {
    const { data, error } = await supabase
      .from('team_battles')
      .insert([{ team_a: teamAId, team_b: teamBId, tournament_id: tournamentId, status: 'upcoming' }])
      .select()
      .single();

    if (error) throw error;

    // Create 3 matches for the battle (3v3 format)
    const matches = [];
    for (let i = 0; i < 3; i++) {
      matches.push({
        team_battle_id: data.id,
        status: 'upcoming'
      });
    }

    await supabase.from('team_matches').insert(matches);

    return data;
  }
}

module.exports = new TeamService();
