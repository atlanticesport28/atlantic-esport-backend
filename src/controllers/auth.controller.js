const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, username, role, continent, country } = req.body;
      const data = await authService.register(email, password, username, role, continent, country);
      success(res, data, 'Registration successful. Please verify your email.', 201);
    } catch (err) {
      error(res, err.message);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      success(res, data, 'Login successful');
    } catch (err) {
      error(res, err.message, 401);
    }
  }
}

module.exports = new AuthController();
