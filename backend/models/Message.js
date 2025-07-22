const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: function() {
      return !this.files || this.files.length === 0;
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'emoji', 'mixed'],
    default: 'text'
  },
  files: [{
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    },
    filename: String,
    originalName: String,
    url: String,
    mimetype: String,
    size: Number,
    category: String
  }],
  emojis: [{
    unicode: String,
    shortcode: String,
    position: Number // Position in the message text
  }],
  reactions: [{
    userId: String,
    emoji: String,
    timestamp: { type: Date, default: Date.now }
  }],
  editHistory: [{
    previousMessage: String,
    editedAt: { type: Date, default: Date.now }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  readAt: Date,
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  hiddenFor: [{
    userId: String,
    hiddenAt: { type: Date, default: Date.now }
  }]
});

// Index for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ read: 1 });

module.exports = mongoose.model('Message', messageSchema);
