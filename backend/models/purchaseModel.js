const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  date: String,
  farmer: String,
  price: String,
  quantity: String,
  status: String,
  location: String,
  // Add other fields as needed
});

module.exports = mongoose.model("Purchase", purchaseSchema);