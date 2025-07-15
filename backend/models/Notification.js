const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user who should receive the notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['bid_accepted', 'bid_rejected', 'order_confirmed', 'payment_received', 'general'],
    default: 'general'
  },
  isRead: { type: Boolean, default: false },
  relatedId: { type: String }, // ID of related bid, order, etc.
  metadata: {
    bidId: String,
    productName: String,
    amount: Number,
    farmerId: String,
    farmerName: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
