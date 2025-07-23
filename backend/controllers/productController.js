// Enhanced chain-based filtering endpoints

// Get available districts based on current filters (progressive filtering)
const getFilteredDistricts = async (req, res) => {
  try {
    const { search, type, maxPrice } = req.query;
    
    // Build match stage based on current filters (excluding district)
    let matchStage = {};
    
    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 3) {
        matchStage.$text = { $search: searchTerm };
      } else {
        matchStage.$or = [
          { name: { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" } },
          { name: { $regex: escapeRegex(searchTerm), $options: "i" } },
          { description: { $regex: escapeRegex(searchTerm), $options: "i" } }
        ];
      }
    }
    
    // Apply type filter if provided
    if (type && type.trim() && type !== "All Types") {
      matchStage.type = { $regex: `^${escapeRegex(type.trim())}$`, $options: "i" };
    }
    
    // Apply price filter if provided
    if (maxPrice) {
      matchStage.price = { $lte: Number(maxPrice) };
    }

    const districts = await Product.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "farmerID",
          foreignField: "auth0Id",
          as: "farmer"
        }
      },
      { $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$farmer.district",
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          district: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(districts);
  } catch (err) {
    console.error("Error fetching filtered districts:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// Get available product types based on current filters (progressive filtering)
const getFilteredTypes = async (req, res) => {
  try {
    const { search, district, maxPrice } = req.query;
    
    // Build aggregation pipeline
    let pipeline = [];
    
    // First match stage for basic filters (excluding type)
    let matchStage = {};
    
    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 3) {
        matchStage.$text = { $search: searchTerm };
      } else {
        matchStage.$or = [
          { name: { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" } },
          { name: { $regex: escapeRegex(searchTerm), $options: "i" } },
          { description: { $regex: escapeRegex(searchTerm), $options: "i" } }
        ];
      }
    }
    
    // Apply price filter if provided
    if (maxPrice) {
      matchStage.price = { $lte: Number(maxPrice) };
    }

    pipeline.push({ $match: matchStage });
    
    // Lookup farmer details for district filtering
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "farmerID",
        foreignField: "auth0Id",
        as: "farmer"
      }
    });
    
    pipeline.push({ $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } });
    
    // Apply district filter if provided
    if (district && district !== "All Districts") {
      pipeline.push({
        $match: {
          "farmer.district": { $regex: escapeRegex(district), $options: "i" }
        }
      });
    }
    
    // Group by type and count
    pipeline.push({
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    });
    
    pipeline.push({
      $match: {
        _id: { $ne: null, $ne: "" }
      }
    });
    
    pipeline.push({ $sort: { count: -1 } });
    
    pipeline.push({
      $project: {
        type: "$_id",
        count: 1,
        _id: 0
      }
    });

    const types = await Product.aggregate(pipeline);
    res.json(types);
  } catch (err) {
    console.error("Error fetching filtered types:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// Get available product names based on current filters (progressive filtering)
const getFilteredProductNames = async (req, res) => {
  try {
    const { type, district, maxPrice, search } = req.query;
    
    let pipeline = [];
    let matchStage = {};
    
    // Apply type filter if provided
    if (type && type.trim() && type !== "All Types") {
      matchStage.type = { $regex: `^${escapeRegex(type.trim())}$`, $options: "i" };
    }
    
    // Apply price filter if provided
    if (maxPrice) {
      matchStage.price = { $lte: Number(maxPrice) };
    }
    
    // Apply partial search if provided (for autocomplete)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      matchStage.name = { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" };
    }

    pipeline.push({ $match: matchStage });
    
    // Lookup farmer details for district filtering
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "farmerID",
        foreignField: "auth0Id",
        as: "farmer"
      }
    });
    
    pipeline.push({ $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } });
    
    // Apply district filter if provided
    if (district && district !== "All Districts") {
      pipeline.push({
        $match: {
          "farmer.district": { $regex: escapeRegex(district), $options: "i" }
        }
      });
    }
    
    // Group by product name and count occurrences
    pipeline.push({
      $group: {
        _id: "$name",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        totalStock: { $sum: "$quantity" }
      }
    });
    
    pipeline.push({ $sort: { count: -1, _id: 1 } });
    pipeline.push({ $limit: 20 }); // Limit for performance
    
    pipeline.push({
      $project: {
        name: "$_id",
        count: 1,
        avgPrice: { $round: ["$avgPrice", 2] },
        totalStock: 1,
        _id: 0
      }
    });

    const productNames = await Product.aggregate(pipeline);
    res.json(productNames);
  } catch (err) {
    console.error("Error fetching filtered product names:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// Get price range based on current filters (progressive filtering)
const getFilteredPriceRange = async (req, res) => {
  try {
    const { search, type, district } = req.query;
    
    let pipeline = [];
    let matchStage = {};
    
    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 3) {
        matchStage.$text = { $search: searchTerm };
      } else {
        matchStage.$or = [
          { name: { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" } },
          { name: { $regex: escapeRegex(searchTerm), $options: "i" } }
        ];
      }
    }
    
    // Apply type filter if provided
    if (type && type.trim() && type !== "All Types") {
      matchStage.type = { $regex: `^${escapeRegex(type.trim())}$`, $options: "i" };
    }

    pipeline.push({ $match: matchStage });
    
    // Lookup farmer details for district filtering
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "farmerID",
        foreignField: "auth0Id",
        as: "farmer"
      }
    });
    
    pipeline.push({ $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } });
    
    // Apply district filter if provided
    if (district && district !== "All Districts") {
      pipeline.push({
        $match: {
          "farmer.district": { $regex: escapeRegex(district), $options: "i" }
        }
      });
    }
    
    // Calculate price statistics
    pipeline.push({
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        avgPrice: { $avg: "$price" },
        count: { $sum: 1 }
      }
    });
    
    pipeline.push({
      $project: {
        minPrice: { $round: ["$minPrice", 2] },
        maxPrice: { $round: ["$maxPrice", 2] },
        avgPrice: { $round: ["$avgPrice", 2] },
        count: 1,
        _id: 0
      }
    });

    const priceRange = await Product.aggregate(pipeline);
    res.json(priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0, count: 0 });
  } catch (err) {
    console.error("Error fetching filtered price range:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// Get unique districts from farmers who have products
const getAvailableDistricts = async (req, res) => {
  try {
    const districts = await Product.aggregate([
      // Lookup farmer details
      {
        $lookup: {
          from: "users",
          localField: "farmerID",
          foreignField: "auth0Id",
          as: "farmer"
        }
      },
      
      // Unwind farmer array
      { $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } },
      
      // Group by district to get unique values
      {
        $group: {
          _id: "$farmer.district"
        }
      },
      
      // Filter out null/empty districts
      {
        $match: {
          _id: { $ne: null, $ne: "" }
        }
      },
      
      // Sort alphabetically
      { $sort: { _id: 1 } },
      
      // Project to rename _id to district
      {
        $project: {
          district: "$_id",
          _id: 0
        }
      }
    ]);

    const districtNames = districts.map(d => d.district);
    res.json(districtNames);
  } catch (err) {
    console.error("Error fetching districts:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

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
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

// Fetch all products with backend filtering and pagination using efficient aggregation
const getProducts = async (req, res) => {
  try {
    const { search, district, maxPrice, type, page = 1, limit = 8, sort = 'desc', sortBy = 'listedDate', sortOrder } = req.query;
    
    // Build match stage for MongoDB aggregation
    let matchStage = {};
    
    // Enhanced search functionality with multiple strategies
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // Create multiple search strategies for better accuracy
      const searchConditions = [
        // 1. Exact match (highest priority)
        { name: { $regex: `^${escapeRegex(searchTerm)}$`, $options: "i" } },
        
        // 2. Starts with (high priority)
        { name: { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" } },
        
        // 3. Contains whole word (medium priority)
        { name: { $regex: `\\b${escapeRegex(searchTerm)}\\b`, $options: "i" } },
        
        // 4. Contains anywhere (lower priority)
        { name: { $regex: escapeRegex(searchTerm), $options: "i" } },
        
        // 5. Description match (if no type filter is applied)
        { description: { $regex: escapeRegex(searchTerm), $options: "i" } }
      ];
      
      // Use MongoDB text search if available, otherwise use regex
      if (searchTerm.length >= 3) {
        // For longer searches, use text search for better performance
        matchStage.$text = { $search: searchTerm };
      } else {
        // For shorter searches, use OR condition with different strategies
        matchStage.$or = searchConditions;
      }
    }
    
    // Add type filtering with case-insensitive matching
    if (type && type.trim() && type !== "All Types") {
      matchStage.type = { $regex: `^${escapeRegex(type.trim())}$`, $options: "i" };
    }
    
    if (maxPrice) {
      matchStage.price = { $lte: Number(maxPrice) };
    }

    // Determine sort order
    let sortDirection = 1; // Default ascending
    if (sortOrder) {
      sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    } else if (sort) {
      sortDirection = sort.toLowerCase() === 'desc' ? -1 : 1;
    }
    
    // Handle sortBy field with minus prefix (e.g., '-listedDate')
    let sortField = sortBy || 'listedDate';
    if (sortField.startsWith('-')) {
      sortField = sortField.substring(1);
      sortDirection = -1;
    }

    // Create sort object
    const sortOptions = {};
    
    // If using text search, add score sorting for relevance
    if (matchStage.$text) {
      sortOptions.score = { $meta: "textScore" }; // Sort by relevance first
      sortOptions[sortField] = sortDirection; // Then by specified field
    } else {
      sortOptions[sortField] = sortDirection;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build aggregation pipeline
    const pipeline = [
      // Match basic product filters first
      { $match: matchStage },
      
      // Add text score for sorting if using text search
      ...(matchStage.$text ? [{
        $addFields: { score: { $meta: "textScore" } }
      }] : []),
      
      // Lookup farmer details to get district information
      {
        $lookup: {
          from: "users",
          localField: "farmerID",
          foreignField: "auth0Id",
          as: "farmer"
        }
      },
      
      // Unwind farmer array (should be single farmer)
      { $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } },
      
      // Add district filtering if specified
      ...(district && district !== "All Districts" ? [{
        $match: {
          "farmer.district": { $regex: escapeRegex(district), $options: "i" }
        }
      }] : []),
      
      // Project only needed fields
      {
        $project: {
          name: 1,
          price: 1,
          quantity: 1,
          image: 1,
          listedDate: 1,
          farmerID: 1,
          harvestDetails: 1,
          itemCode: 1,
          location: 1,
          productID: 1,
          type: 1,
          description: 1,
          // Add farmer district for frontend use
          farmerDistrict: "$farmer.district",
          farmerName: "$farmer.name",
          // Include search score if applicable
          ...(matchStage.$text ? { score: 1 } : {})
        }
      },
      
      // Sort (relevance first if text search, then by specified field)
      { $sort: sortOptions },
      
      // Facet for pagination and count
      {
        $facet: {
          products: [
            { $skip: skip },
            { $limit: Number(limit) }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    const result = await Product.aggregate(pipeline);
    
    const products = result[0].products || [];
    const total = result[0].totalCount[0]?.count || 0;

    // Log search performance for debugging
    if (search || type) {
      console.log(`Search "${search || ''}" with type "${type || 'All'}" returned ${total} results in ${products.length} products per page`);
    }

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      searchTerm: search || null,
      filterType: type || null,
      isTextSearch: !!matchStage.$text
    });
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// Helper function to escape special regex characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get search suggestions for autocomplete
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query; // query parameter
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: `^${escapeRegex(q)}`, $options: "i" } },
            { type: { $regex: `^${escapeRegex(q)}`, $options: "i" } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          names: { $addToSet: "$name" },
          types: { $addToSet: "$type" }
        }
      },
      {
        $project: {
          suggestions: {
            $slice: [
              {
                $setUnion: [
                  { $filter: { input: "$names", cond: { $regexMatch: { input: "$$this", regex: `^${escapeRegex(q)}`, options: "i" } } } },
                  { $filter: { input: "$types", cond: { $regexMatch: { input: "$$this", regex: `^${escapeRegex(q)}`, options: "i" } } } }
                ]
              },
              10 // Limit to 10 suggestions
            ]
          }
        }
      }
    ]);

    const result = suggestions.length > 0 ? suggestions[0].suggestions || [] : [];
    res.json(result);
  } catch (err) {
    console.error("Error getting search suggestions:", err);
    res.status(500).json({ message: "Error getting suggestions", error: err.message });
  }
};

// Get popular search terms
const getPopularSearchTerms = async (req, res) => {
  try {
    const popularTerms = await Product.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 8
      },
      {
        $project: {
          term: "$_id",
          count: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          _id: 0
        }
      }
    ]);

    res.json(popularTerms);
  } catch (err) {
    console.error("Error getting popular search terms:", err);
    res.status(500).json({ message: "Error getting popular terms", error: err.message });
  }
};

// Get available product types for filtering
const getAvailableTypes = async (req, res) => {
  try {
    const types = await Product.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const typeNames = types.map(t => t.type);
    res.json(typeNames);
  } catch (err) {
    console.error("Error fetching product types:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// Create new product
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

    if (!type || !name || !price || !quantity || !image) {
      console.log("Missing fields:", { type, name, price, quantity, image });
      return res.status(400).json({ 
        message: "Missing required fields",
        details: "All fields are required" 
      });
    }

    if (!location || !location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
      console.log("Missing location data:", location);
      return res.status(400).json({ 
        message: "Location data is required",
        details: "Please provide valid location coordinates" 
      });
    }

    // Generate item code: HVT-YYYY-MM-DD-XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timeStamp = now.getTime().toString().slice(-4);
    const itemCode = `HVT-${year}-${month}-${day}-${timeStamp}`;

    const productData = {
      type,
      name,
      price: Number(price),
      quantity: Number(quantity),
      originalQuantity: Number(quantity), // From GitHub
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

// Get products by farmer ID
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
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  getProductsByFarmer,
  getProductById,
  getAvailableDistricts,
  getSearchSuggestions,
  getPopularSearchTerms,
  getAvailableTypes,
  // Progressive filtering endpoints
  getFilteredDistricts,
  getFilteredTypes,
  getFilteredProductNames,
  getFilteredPriceRange
};
