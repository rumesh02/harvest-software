const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema(
  {
    vehicleType: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    loadCapacity: {
      type: String,
      required: true,
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: false,
    },
    transporterId: {
      type: String, // Store Auth0 user.sub
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;