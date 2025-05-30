const express = require('express');
const router = express.Router();
const multer = require('multer');
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
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.put('/:id', upload.single('vehicleImage'), updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;