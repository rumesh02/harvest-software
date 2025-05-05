const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  farmerId: {
    type: String,  // Changed to String to match Auth0 ID format
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  completedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);