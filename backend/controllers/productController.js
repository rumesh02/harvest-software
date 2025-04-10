const Product = require("../models/Product");

// Fetch all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "name price quantity image listedDate");
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

module.exports = { getProducts };