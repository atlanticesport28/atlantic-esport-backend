const userService = require('../services/user.service');
const { success, error } = require('../utils/response');

class LeaderboardController {
  async getLeaderboard(req, res) {
    try {
      const { country } = req.query;
      const leaderboard = await userService.getLeaderboard(country);
      success(res, leaderboard);
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new LeaderboardController();
