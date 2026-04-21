const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const checkScope = require('../middlewares/scope.middleware');

router.get('/', authenticate, tournamentController.getAll);
router.get('/my', authenticate, authorize(2), tournamentController.getMyTournaments);
router.get('/:id', authenticate, tournamentController.getById);

router.post('/create', authenticate, authorize(2, 'create_tournament'), checkScope, tournamentController.create);
router.put('/edit/:id', authenticate, authorize(2), tournamentController.edit);
router.post('/submit/:id', authenticate, authorize(2), tournamentController.submit);
router.post('/start/:id', authenticate, authorize(2, 'start_tournament'), tournamentController.start);
router.post('/join', authenticate, tournamentController.join);

module.exports = router;
