// Import all modular controllers
const browsingController = require('./product/browsingController');
const crudController = require('./product/crudController');
const filterController = require('./product/filterController');
const searchController = require('./product/searchController');

// Re-export all functions for compatibility with existing routes
module.exports = {
  // Product browsing (main listing with pagination and search)
  getProducts: browsingController.getProducts,

  // CRUD operations
  createProduct: crudController.createProduct,
  updateProduct: crudController.updateProduct,
  deleteProduct: crudController.deleteProduct,
  getProductById: crudController.getProductById,
  getProductsByFarmer: crudController.getProductsByFarmer,

  // Progressive filtering
  getFilteredDistricts: filterController.getFilteredDistricts,
  getFilteredTypes: filterController.getFilteredTypes,
  getFilteredProductNames: filterController.getFilteredProductNames,
  getFilteredPriceRanges: filterController.getFilteredPriceRange,
  getProductsByType: filterController.getProductsByType,
  getProductsByDistrict: filterController.getProductsByDistrict,
  
  // Aliases for compatibility with existing routes
  getFilteredPriceRange: filterController.getFilteredPriceRange,
  getAvailableDistricts: filterController.getAvailableDistricts, 
  getAvailableTypes: filterController.getAvailableTypes,

  // Search functionality
  getSearchSuggestions: searchController.getSearchSuggestions,
  getPopularSearchTerms: searchController.getPopularSearchTerms
};
