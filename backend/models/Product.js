const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  farmerID: { type: String, required: true },
  image: { type: String, required: true },
  listedDate: { type: Date, default: Date.now },
  productID: { type: String }, // Optional: Auto-generated if not provided
  itemCode: { type: String, required: true, unique: true }, // Unique item code (HVT-YYYY-MM-DD-XXXX)
  description: { type: String },

  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: { type: String, required: true }
  },

  harvestDetails: {
    harvestDate: { type: Date },
    method: { type: String },
    location: { type: String }
  }

}, { collection: 'products' }); // Explicitly specify collection name

// Create text index for efficient search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  type: 'text' 
}, {
  weights: {
    name: 10,        // Give name highest priority
    type: 5,         // Type medium priority
    description: 1   // Description lowest priority
  },
  name: 'product_text_index'
});

// Create compound index for common queries
productSchema.index({ farmerID: 1, listedDate: -1 });
productSchema.index({ price: 1, listedDate: -1 });
productSchema.index({ type: 1, listedDate: -1 });

module.exports = mongoose.model("Product", productSchema);
