// models/Vehicle.js
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  loadCapacity: { type: String, required: true },
  imageUrl: { type: String }, // Store the file path or cloud storage URL
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
