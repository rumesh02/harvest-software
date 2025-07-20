const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'pdf', 'spreadsheet', 'presentation', 'archive', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  // For image files
  dimensions: {
    width: Number,
    height: Number
  },
  // For video/audio files
  duration: Number,
  // File metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// Index for efficient queries
FileSchema.index({ uploadedBy: 1, uploadedAt: -1 });
FileSchema.index({ category: 1 });

const File = mongoose.model('File', FileSchema);

module.exports = File;
