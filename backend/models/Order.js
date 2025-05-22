const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  orderWeight: {
    type: Number,
    required: true
  },
  merchantId: {
    type: String,
    required: true
  },
  merchantName: {
    type: String,
    required: true
  },
  merchantPhone: {
    type: String,
    required: true
  },
  farmerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'Rejected']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  completedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Order', orderSchema);