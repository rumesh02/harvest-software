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
  picture: { type: String } // ✅ NEW field to store base64 image
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
