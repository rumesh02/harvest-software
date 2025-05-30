const express = require('express');
const router = express.Router();
const { getTransporterDashboard } = require('../controllers/TransporterDashboardController');

router.get('/api/dashboard/transporter/:transporterId', getTransporterDashboard);

module.exports = router;