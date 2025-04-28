const Vehicle = require("../models/Vehicle");
const path = require("path");

// Controller function to handle adding a new vehicle
const addVehicle = async (req, res) => {
  try {
    const { vehicleType, licensePlate, loadCapacity } = req.body;
    const filePath = req.file ? req.file.filename : null;

    const newVehicle = new Vehicle({
      vehicleType,
      licensePlate,
      loadCapacity,
      image: filePath,
    });

    await newVehicle.save();
    res.status(200).json({ message: "Vehicle added successfully" });
  } catch (error) {
    console.error("Error saving vehicle:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addVehicle,
};
