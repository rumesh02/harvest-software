const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

router.get('/api/merchant/dashboard/:userSub', merchantController.getDashboardData);

module.exports = router;