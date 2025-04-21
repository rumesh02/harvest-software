const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // assuming you have a User model
    },
    vehicleType: {
        type: String,
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
