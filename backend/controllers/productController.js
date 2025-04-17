const Product = require("../models/Product");
const mongoose = require("mongoose"); // Add this import

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

// Create new product
const createProduct = async (req, res) => {
  console.log("Received product data:", req.body);

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    const {
      type,
      name,
      price,
      quantity,
      image,
      farmerID
    } = req.body;

    // Validate required fields
    if (!type || !name || !price || !quantity || !image) {
      console.log("Missing fields:", { type, name, price, quantity, image });
      return res.status(400).json({ 
        message: "Missing required fields",
        details: "All fields are required" 
      });
    }

    // Create product with validated data
    const productData = {
      type,
      name,
      price: Number(price),
      quantity: Number(quantity),
      farmerID: farmerID || "default",
      image,
      productID: Date.now().toString(),
      listedDate: new Date(),
      description: "",
      harvestDetails: {
        harvestDate: new Date(),
        method: "",
        location: ""
      }
    };

    console.log("Creating new product with data:", productData);

    // Create and save the product
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    console.log("Product saved successfully:", savedProduct);

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct
    });

  } catch (err) {
    console.error("Error in createProduct:", err);
    return res.status(500).json({ 
      message: "Error creating product", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updates,
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

module.exports = { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct 
};