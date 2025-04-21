const express = require('express');
const router = express.Router();
const { addVehicle } = require('../controllers/vehicleController');

// POST /api/vehicles/add
router.post('/', addVehicle);

module.exports = router;
