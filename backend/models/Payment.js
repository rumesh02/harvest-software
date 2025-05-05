const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConfirmedBid', // Update this reference
    required: true
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
  method: {
    type: String,
    enum: ['credit_card', 'apple_pay', 'paypal', 'bitcoin', 'stripe'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'processing', 'completed', 'failed', 'refunded'],
    default: 'initiated'
  },
  transactionId: String,
  gateway: String,
  gatewayResponse: Object,
  maskedCardNumber: String,
  refundedAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);