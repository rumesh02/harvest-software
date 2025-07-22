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
  merchantId: {
    type: String, // Auth0 user.sub for merchant
    required: true,
  },
  merchantPhone: {
    type: String,
    required: true,
  },
  merchantName: {
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Add other fields as needed
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);