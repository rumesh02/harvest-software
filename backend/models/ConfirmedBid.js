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
  itemCode: {
    type: String,
    index: true // Add item code field with index for faster searches
  },
  productLocation: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String }
  },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number,
    itemCode: String // Add item code to items as well
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
  },
  transportSelected: {
    type: Boolean,
    default: null // null = not answered, true = yes, false = no
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

module.exports = mongoose.model('ConfirmedBid', OrderSchema, 'confirmedBids');