const userService = require('../services/user.service');
const { success, error } = require('../utils/response');

class UserController {
  async getUser(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      success(res, user);
    } catch (err) {
      error(res, err.message, 404);
    }
  }

  async updateProfile(req, res) {
    try {
      // Prevent role escalation
      const { role, points, wins, losses, ...updates } = req.body;
      const updatedUser = await userService.updateProfile(req.user.id, updates);
      success(res, updatedUser, 'Profile updated successfully');
    } catch (err) {
      error(res, err.message);
    }
  }

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

module.exports = new UserController();
