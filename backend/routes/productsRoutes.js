const express = require("express");
const router = express.Router();
const { 
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
} = require("../controllers/productController");

// GET: Search suggestions for autocomplete
router.get("/search/suggestions", getSearchSuggestions);

// GET: Popular search terms
router.get("/search/popular", getPopularSearchTerms);

// Progressive filtering endpoints - ORDER MATTERS (most specific first)
// GET: Filtered product names based on current filters
router.get("/filter/names", getFilteredProductNames);

// GET: Filtered districts based on current filters  
router.get("/filter/districts", getFilteredDistricts);

// GET: Filtered types based on current filters
router.get("/filter/types", getFilteredTypes);

// GET: Price range based on current filters
router.get("/filter/price-range", getFilteredPriceRange);

// GET: Available product types for filtering
router.get("/types", getAvailableTypes);

// GET: Available districts from farmers
router.get("/districts", getAvailableDistricts);

// GET: Product by ID (for stock/status lookup)
router.get("/:id", getProductById);

// GET: Browse all products
router.get("/", getProducts);

// GET: Products by farmer ID
router.get("/farmer/:farmerID", getProductsByFarmer);

// POST: Create new product
router.post("/", createProduct);

// DELETE: Remove a product
router.delete("/:id", deleteProduct);

// PUT: Update a product
router.put("/:id", updateProduct);

module.exports = router;