const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);
