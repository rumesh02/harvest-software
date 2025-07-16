const Product = require("../models/Product");
const mongoose = require("mongoose"); // Add this import

// Fetch all products with backend filtering and pagination
const getProducts = async (req, res) => {
  try {
    const { search, district, maxPrice, page = 1, limit = 8 } = req.query;
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (district && district !== "All Districts") {
      filter["harvestDetails.location"] = { $regex: district, $options: "i" };
    }
    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter, "name price quantity image listedDate farmerID harvestDetails itemCode location productID")
      .skip(skip)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
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
      farmerID,
      description,
      location
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

    // Generate a structured item code: HVT-YYYY-MM-DD-XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timeStamp = now.getTime().toString().slice(-4); // Last 4 digits of timestamp
    const itemCode = `HVT-${year}-${month}-${day}-${timeStamp}`;

    // Create product with validated data
    const productData = {
      type,
      name,
      price: Number(price),
      quantity: Number(quantity),
      farmerID: farmerID || "default",
      image,
      productID: new mongoose.Types.ObjectId().toString(), // Generate unique productID
      itemCode: itemCode, // User-facing structured item code
      listedDate: new Date(),
      description: description || "",
      location: {
        coordinates: {
          lat: Number(location.coordinates.lat),
          lng: Number(location.coordinates.lng)
        },
        address: location.address || ""
      },
      harvestDetails: {
        harvestDate: new Date(),
        method: "",
        location: location.address || ""
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

// Get products by farmer ID
const getProductsByFarmer = async (req, res) => {
  try {
    const { farmerID } = req.params;
    
    if (!farmerID) {
      return res.status(400).json({ message: "Farmer ID is required" });
    }

    const products = await Product.find({ farmerID });
    
    if (products.length === 0) {
      return res.json([]);
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

module.exports = { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  getProductsByFarmer // Add this export
};