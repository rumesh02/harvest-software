const express = require("express");
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  getProductsByFarmer
} = require("../controllers/productController");

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