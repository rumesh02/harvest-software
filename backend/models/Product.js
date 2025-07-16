const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  farmerID: { type: String, required: true },
  image: { type: String, required: true },
  listedDate: { type: Date, default: Date.now },
  productID: { type: String }, // Make productID optional since it can be auto-generated
  itemCode: { type: String, required: true, unique: true }, // Add itemCode field
  description: { type: String },
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: { type: String, required: true }
  },
  harvestDetails: {
    harvestDate: Date,
    method: String,
    location: String
  }
}, { collection: 'products' }); // Explicitly specify collection name

module.exports = mongoose.model("Product", productSchema);
