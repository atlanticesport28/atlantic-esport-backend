const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');

router.get('/', testController.testConnection);
router.get('/crud', testController.testCrud);

module.exports = router;
