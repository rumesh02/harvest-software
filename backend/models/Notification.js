const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user who should receive the notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['bid_accepted', 'bid_rejected', 'order_confirmed', 'payment_received', 'message', 'general'],
    default: 'general'
  },
  isRead: { type: Boolean, default: false },
  relatedId: { type: String }, // ID of related bid, order, message, etc.
  metadata: {
    bidId: String,
    productName: String,
    amount: Number,
    farmerId: String,
    farmerName: String,
    // Message notification metadata
    senderId: String,
    senderName: String,
    senderPicture: String,
    senderRole: String,
    messagePreview: String,
    messageId: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
