const express = require('express');
const router = express.Router();
const { getTransporterDashboard } = require('../controllers/TransporterdashboardController');

router.get('/transporter/:transporterId', getTransporterDashboard);

module.exports = router;