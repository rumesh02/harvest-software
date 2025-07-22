const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user who should receive the notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['bid_accepted', 'bid_rejected', 'order_confirmed', 'payment_received', 'vehicle_booked', 'booking_confirmed', 'booking_rejected', 'message', 'general'],
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
    merchantId: String,
    merchantName: String,
    transporterId: String,
    transporterName: String,
    vehicleId: String,
    vehicleType: String,
    bookingId: String,
    startLocation: String,
    endLocation: String,
    weight: String,
    items: String,
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
