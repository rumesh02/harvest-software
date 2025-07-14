const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  transporterId: {
    type: String, // Auth0 user.sub
    required: true,
  },
  merchantPhone: {
    type: String,
    required: true,
  },
  startLocation: {
    type: String,
    required: true,
  },
  endLocation: {
    type: String,
    required: true,
  },
  items: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  startLat: {
    type: Number,
    required: true,
  },
  startLng: {
    type: Number,
    required: true,
  },
  endLat: {
    type: Number,
    required: true,
  },
  endLng: {
    type: Number,
    required: true,
  },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);