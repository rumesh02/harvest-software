const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true }, // e.g., auth0|123456
  email: { type: String, required: true },
  name: { type: String, required: true }, // Combined first + last name
  phone: { type: String, required: true },
  nic: { type: String, required: true },
  gender: { type: String },
  address: { type: String },
  province: { type: String },
  district: { type: String },
  role: { type: String, required: true }, // farmer / merchant / transporter
  picture: { type: String }, // ✅ Profile image (optional)

  location: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Rating field for farmers
  farmerRatings: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
