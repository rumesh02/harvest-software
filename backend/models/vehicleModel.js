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
    image: {  // Changed from imageUrl to image
      type: String,
      required: false,
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