const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.post('/create', authenticate, matchController.create);
router.post('/start', authenticate, matchController.start);
router.post('/add-live', authenticate, matchController.addLive);
router.post('/submit', authenticate, matchController.submit);
router.post('/set-winner', authenticate, authorize(2), matchController.setWinner);
router.get('/:id', authenticate, matchController.getById);

module.exports = router;
