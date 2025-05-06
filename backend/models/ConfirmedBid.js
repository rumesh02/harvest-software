const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  merchantId: {
    type: String,
    required: true,
    index: true
  },
  farmerId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  status: {
    type: String,
    enum: ['confirmed', 'processing', 'paid', 'canceled'],
    default: 'confirmed',
    index: true
  },
  paymentMethod: String,
  paymentId: String,
  paymentAttempts: [{
    date: Date,
    cardNumber: String,
    status: String,
    error: String
  }],
  notes: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

module.exports = mongoose.model('ConfirmedBid', OrderSchema, 'confirmedBids');