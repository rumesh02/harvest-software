const Vehicle = require('../models/vehicleModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Import your User model

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Public
const addVehicle = asyncHandler(async (req, res) => {
  const { vehicleType, licensePlate, loadCapacity, pricePerKm, transporterId, district } = req.body;

  const vehicleExists = await Vehicle.findOne({ licensePlate });
  if (vehicleExists) {
    res.status(400);
    throw new Error('A vehicle with this license plate already exists');
  }

  let image = null;
  if (req.file) {
    const buffer = req.file.buffer;
    image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
  }

  const vehicle = new Vehicle({
    vehicleType,
    licensePlate,
    loadCapacity,
    pricePerKm,
    transporterId, // Auth0 user.sub
    district,
    image,
  });

  const createdVehicle = await vehicle.save();
  res.status(201).json(createdVehicle);
});

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = asyncHandler(async (req, res) => {
  // Get all vehicles instead of filtering by user
  const vehicles = await Vehicle.find({});
  res.json(vehicles);
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Public
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  vehicle.vehicleType = req.body.vehicleType || vehicle.vehicleType;
  vehicle.licensePlate = req.body.licensePlate || vehicle.licensePlate;
  vehicle.loadCapacity = req.body.loadCapacity || vehicle.loadCapacity;
  vehicle.pricePerKm = req.body.pricePerKm || vehicle.pricePerKm;
  
  // Update image if provided
  if (req.file) {
    // Convert buffer directly to base64 string
    const buffer = req.file.buffer;
    vehicle.image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
  }
  
  const updatedVehicle = await vehicle.save();
  res.json(updatedVehicle);
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Public
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  await vehicle.deleteOne();
  res.json({ message: 'Vehicle removed' });
});

module.exports = {
  addVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};