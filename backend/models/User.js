const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  nic: { type: String, required: true },
  gender: { type: String },
  address: { type: String },
  province: { type: String },
  district: { type: String },
  role: { type: String, required: true }, // farmer / merchant / transporter
  farmerRatings: { type: Number, default: 0 } // <-- Add this line
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
