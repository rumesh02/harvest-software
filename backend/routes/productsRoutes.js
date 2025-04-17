const express = require("express");
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct 
} = require("../controllers/productController");

// GET: Browse all products
router.get("/", getProducts);

// POST: Create new product
router.post("/", createProduct);

// DELETE: Remove a product
router.delete("/:id", deleteProduct);

// PUT: Update a product
router.put("/:id", updateProduct);

module.exports = router;