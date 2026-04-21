const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const authenticate = require('../middlewares/auth.middleware');

router.post('/create', authenticate, teamController.create);
router.post('/join', authenticate, teamController.join);

module.exports = router;
