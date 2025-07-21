const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true }, // e.g., auth0|123456
  email: { type: String, required: true },
  name: { type: String, required: true }, // Full name
  phone: { type: String, required: true },
  nic: { type: String, required: true },
  gender: { type: String },
  address: { type: String },
  province: { type: String },
  district: { type: String },
  role: { type: String, required: true }, // farmer / merchant / transporter

  // Profile picture (base64 or URL)
  picture: { type: String },

  // Farmer rating average (only applies to role: 'farmer')
  farmerRating: { type: Number, default: 0 },

  // Optional location object
  location: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
