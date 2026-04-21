const adminService = require('../services/admin.service');
const { success, error } = require('../utils/response');

class AdminController {
  async getPending(req, res) {
    try {
      const tournaments = await adminService.getPendingTournaments();
      success(res, tournaments);
    } catch (err) {
      error(res, err.message);
    }
  }

  async approve(req, res) {
    try {
      const tournament = await adminService.approveTournament(req.params.id);
      success(res, tournament, 'Tournament approved');
    } catch (err) {
      error(res, err.message);
    }
  }

  async reject(req, res) {
    try {
      const { message } = req.body;
      const tournament = await adminService.rejectTournament(req.params.id, message);
      success(res, tournament, 'Tournament rejected');
    } catch (err) {
      error(res, err.message);
    }
  }

  async validateMatch(req, res) {
    try {
      const { match_id, score_a, score_b } = req.body;
      const match = await adminService.validateMatch(match_id, score_a, score_b);
      success(res, match, 'Match validated and resolved by admin');
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new AdminController();
