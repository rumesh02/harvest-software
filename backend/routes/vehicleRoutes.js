const express = require('express');
const router = express.Router();
const multer = require('multer');
const Vehicle = require('../models/vehicleModel');
const { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) cb(null, true);
    else cb(new Error('Images only (JPEG, JPG, PNG)!'));
  }
});

// Routes
router.post('/', upload.single('vehicleImage'), addVehicle);
router.get('/', async (req, res) => {
  const { capacityFilter, districtFilter } = req.query;

  try {
    let query = {};
    if (capacityFilter) {
      if (capacityFilter === 'below5000') query.loadCapacity = { $lt: 5000 };
      else if (capacityFilter === '5000to10000') query.loadCapacity = { $gte: 5000, $lte: 10000 };
      else if (capacityFilter === 'above10000') query.loadCapacity = { $gt: 10000 };
    }
    if (districtFilter) query.district = districtFilter;

    const vehicles = await Vehicle.find(query);
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});
router.get('/:id', getVehicleById);
router.put('/:id', upload.single('vehicleImage'), updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;