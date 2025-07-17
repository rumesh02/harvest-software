const mongoose = require('mongoose');

const EmojiSchema = new mongoose.Schema({
  unicode: {
    type: String,
    required: true,
    unique: true
  },
  shortcode: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'smileys-people',
      'animals-nature',
      'food-drink',
      'activities',
      'travel-places',
      'objects',
      'symbols',
      'flags'
    ]
  },
  subcategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  skinTones: [{
    unicode: String,
    shortcode: String
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
});

// Index for efficient searches
EmojiSchema.index({ category: 1, subcategory: 1 });
EmojiSchema.index({ shortcode: 1 });
EmojiSchema.index({ tags: 1 });
EmojiSchema.index({ isPopular: -1, usageCount: -1 });

const Emoji = mongoose.model('Emoji', EmojiSchema);

module.exports = Emoji;
