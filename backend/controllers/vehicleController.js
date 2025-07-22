const Vehicle = require('../models/vehicleModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Import your User model

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Public
const addVehicle = asyncHandler(async (req, res) => {
  console.log('🚗 Add vehicle request received');
  console.log('🚗 Request body:', req.body);
  console.log('🚗 Request file:', req.file ? 'File uploaded' : 'No file');
  
  const { vehicleType, licensePlate, loadCapacity, pricePerKm, transporterId, district } = req.body;

  // Validate required fields
  if (!vehicleType || !licensePlate || !loadCapacity || !pricePerKm || !transporterId || !district) {
    console.log('❌ Missing required fields:', {
      vehicleType: !!vehicleType,
      licensePlate: !!licensePlate,
      loadCapacity: !!loadCapacity,
      pricePerKm: !!pricePerKm,
      transporterId: !!transporterId,
      district: !!district
    });
    res.status(400);
    throw new Error('All fields are required: vehicleType, licensePlate, loadCapacity, pricePerKm, transporterId, district');
  }

  // Validate pricePerKm is a positive number
  const price = parseFloat(pricePerKm);
  console.log('🚗 Price validation:', { original: pricePerKm, parsed: price });
  
  if (isNaN(price) || price < 0) {
    console.log('❌ Invalid price:', price);
    res.status(400);
    throw new Error('Price per KM must be a valid positive number');
  }

  const vehicleExists = await Vehicle.findOne({ licensePlate });
  if (vehicleExists) {
    console.log('❌ Vehicle with license plate already exists:', licensePlate);
    res.status(400);
    throw new Error('A vehicle with this license plate already exists');
  }

  let image = null;
  if (req.file) {
    const buffer = req.file.buffer;
    image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
    console.log('🚗 Image processed, size:', buffer.length, 'bytes');
  }

  const vehicleData = {
    vehicleType,
    licensePlate,
    loadCapacity,
    pricePerKm: price,
    transporterId, // Auth0 user.sub
    district,
    image,
  };
  
  console.log('🚗 Creating vehicle with data:', vehicleData);

  const vehicle = new Vehicle(vehicleData);
  const createdVehicle = await vehicle.save();
  
  console.log('✅ Vehicle created successfully:', createdVehicle);
  res.status(201).json(createdVehicle);
});

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = asyncHandler(async (req, res) => {
  console.log('📋 Get vehicles request received');
  console.log('📋 Query params:', req.query);
  
  let filter = {};
  
  // Filter by transporterId if provided in query params
  if (req.query.transporterId) {
    filter.transporterId = req.query.transporterId;
    console.log('📋 Filtering by transporterId:', req.query.transporterId);
  }
  
  const vehicles = await Vehicle.find(filter);
  console.log(`📋 Found ${vehicles.length} vehicles`);
  
  // Log sample vehicle data to verify pricePerKm field
  if (vehicles.length > 0) {
    console.log('📋 Sample vehicle data:', {
      id: vehicles[0]._id,
      vehicleType: vehicles[0].vehicleType,
      licensePlate: vehicles[0].licensePlate,
      pricePerKm: vehicles[0].pricePerKm,
      hasImage: !!vehicles[0].image
    });
  }
  
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
  console.log('🔄 Update vehicle request received:', req.params.id);
  console.log('🔄 Request body:', req.body);
  
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  console.log('🔄 Current vehicle data:', {
    vehicleType: vehicle.vehicleType,
    licensePlate: vehicle.licensePlate,
    loadCapacity: vehicle.loadCapacity,
    pricePerKm: vehicle.pricePerKm
  });
  
  vehicle.vehicleType = req.body.vehicleType || vehicle.vehicleType;
  vehicle.licensePlate = req.body.licensePlate || vehicle.licensePlate;
  vehicle.loadCapacity = req.body.loadCapacity || vehicle.loadCapacity;
  
  // Update pricePerKm if provided
  if (req.body.pricePerKm !== undefined && req.body.pricePerKm !== '') {
    const price = parseFloat(req.body.pricePerKm);
    console.log('🔄 Updating pricePerKm:', { original: req.body.pricePerKm, parsed: price });
    
    if (isNaN(price) || price < 0) {
      res.status(400);
      throw new Error('Price per KM must be a valid positive number');
    }
    vehicle.pricePerKm = price;
  }
  
  // Update image if provided
  if (req.file) {
    // Convert buffer directly to base64 string
    const buffer = req.file.buffer;
    vehicle.image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
  }
  
  console.log('🔄 Vehicle data before save:', {
    vehicleType: vehicle.vehicleType,
    licensePlate: vehicle.licensePlate,
    loadCapacity: vehicle.loadCapacity,
    pricePerKm: vehicle.pricePerKm
  });
  
  const updatedVehicle = await vehicle.save();
  console.log('✅ Vehicle updated successfully:', updatedVehicle);
  
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