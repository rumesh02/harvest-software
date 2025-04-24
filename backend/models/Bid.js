const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    orderWeight: { type: Number, required: true },
    merchantId: { type: String, required: true },
    merchantName: { type: String, required: true },
    merchantPhone: { type: String },
    farmerId: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);