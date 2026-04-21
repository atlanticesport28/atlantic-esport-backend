const teamService = require('../services/team.service');
const { success, error } = require('../utils/response');

class TeamController {
  async create(req, res) {
    try {
      const { name, tag } = req.body;
      const team = await teamService.createTeam(name, tag, req.user.id);
      success(res, team, 'Team created successfully', 201);
    } catch (err) {
      error(res, err.message);
    }
  }

  async join(req, res) {
    try {
      const { team_id } = req.body;
      const membership = await teamService.joinTeam(team_id, req.user.id);
      success(res, membership, 'Joined team successfully');
    } catch (err) {
      error(res, err.message, 400);
    }
  }

  async createBattle(req, res) {
    try {
      const { team_a, team_b, tournament_id } = req.body;
      const battle = await teamService.createTeamBattle(team_a, team_b, tournament_id);
      success(res, battle, 'Team battle created with 3 matches', 201);
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new TeamController();
