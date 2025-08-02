const Product = require("../../models/Product");
const mongoose = require("mongoose");
const { generateItemCode } = require("../../utils/productUtils");

/**
 * Get product by ID for stock/status lookup
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Only return relevant fields for stock/status
    res.json({
      _id: product._id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      listedDate: product.listedDate,
      farmerID: product.farmerID,
      image: product.image,
      stock: product.quantity // Alias for clarity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

/**
 * Create new product
 */
const createProduct = async (req, res) => {
  console.log("Received product data:", req.body);

  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    const {
      type,
      name,
      price,
      quantity,
      image,
      farmerID,
      description,
      location,
      address
    } = req.body;

    // Validate required fields
    if (!type || !name || !price || !quantity || !image) {
      console.log("Missing fields:", { type, name, price, quantity, image });
      return res.status(400).json({ 
        message: "Missing required fields",
        details: "All fields are required" 
      });
    }

    // Validate location data
    if (!location || !location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
      console.log("Missing location data:", location);
      return res.status(400).json({ 
        message: "Location data is required",
        details: "Please provide valid location coordinates" 
      });
    }

    // Generate unique item code
    const itemCode = generateItemCode();

    const productData = {
      type,
      name,
      price: Number(price),
      quantity: Number(quantity),
      originalQuantity: Number(quantity),
      farmerID: farmerID || "default",
      image,
      productID: new mongoose.Types.ObjectId().toString(),
      itemCode,
      listedDate: new Date(),
      description: description || "",
      location: {
        coordinates: {
          lat: Number(location.coordinates.lat),
          lng: Number(location.coordinates.lng)
        },
        address: address || location.address || ""
      },
      harvestDetails: {
        harvestDate: new Date(),
        method: "",
        location: address || location.address || ""
      }
    };

    console.log("Creating new product with data:", productData);

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

/**
 * Update product
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

/**
 * Delete product
 */
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

/**
 * Get products by farmer ID
 */
const getProductsByFarmer = async (req, res) => {
  try {
    const { farmerID } = req.params;
    
    if (!farmerID) {
      return res.status(400).json({ message: "Farmer ID is required" });
    }

    const products = await Product.find({ farmerID });
    
    res.json(products.length === 0 ? [] : products);
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

module.exports = {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByFarmer
};
