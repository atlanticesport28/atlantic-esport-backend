const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');

router.get('/:id', authenticate, userController.getUser);
router.put('/update', authenticate, userController.updateProfile);

module.exports = router;
