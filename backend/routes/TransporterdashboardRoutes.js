const express = require('express');
const router = express.Router();
const { getTransporterDashboard, getTopTransporters } = require('../controllers/TransporterdashboardController');

// Existing route
router.get('/transporter/:transporterId', getTransporterDashboard);

// 🚛 NEW: Get top 5 transporters by booking count
router.get('/top-transporters', getTopTransporters);

module.exports = router;