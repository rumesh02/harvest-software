const express = require("express");
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  getProductsByFarmer,
  getProductById
} = require("../controllers/productController");
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