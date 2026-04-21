const chatService = require('../services/chat.service');
const { success, error } = require('../utils/response');

class ChatController {
  async send(req, res) {
    try {
      const { match_id, message } = req.body;
      const chat = await chatService.sendMessage(match_id, req.user.id, message);
      success(res, chat, 'Message sent');
    } catch (err) {
      error(res, err.message, 400);
    }
  }

  async getMessages(req, res) {
    try {
      const messages = await chatService.getMessages(req.params.match_id);
      success(res, messages);
    } catch (err) {
      error(res, err.message);
    }
  }
}

module.exports = new ChatController();
