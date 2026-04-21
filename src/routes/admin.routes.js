const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const checkScope = require('../middlewares/scope.middleware');

// Admin routes require at least Level 3 (Country Admin)
router.use(authenticate, authorize(3));

router.get('/tournaments/pending', checkScope, adminController.getPending);
router.post('/tournaments/approve/:id', checkScope, adminController.approve);
router.post('/tournaments/reject/:id', checkScope, adminController.reject);
router.post('/matches/validate', authorize(5), adminController.validateMatch); // Only Super Admin for direct validation

module.exports = router;
