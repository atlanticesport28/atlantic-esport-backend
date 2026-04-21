const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authenticate = require('../middlewares/auth.middleware');

router.get('/:match_id', authenticate, chatController.getMessages);
router.post('/send', authenticate, chatController.send);

module.exports = router;
