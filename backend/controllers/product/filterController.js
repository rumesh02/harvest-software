const Product = require("../../models/Product");
const { 
  escapeRegex, 
  buildBasicFilters, 
  buildFarmerLookupPipeline, 
  buildDistrictFilter 
} = require("../../utils/productUtils");

/**
 * Get available districts based on current filters (progressive filtering)
 */
const getFilteredDistricts = async (req, res) => {
  try {
    const { search, type, maxPrice } = req.query;
    
    // Build match stage based on current filters (excluding district)
    const matchStage = buildBasicFilters({ search, type, maxPrice });

    const districts = await Product.aggregate([
      { $match: matchStage },
      ...buildFarmerLookupPipeline(),
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

/**
 * Get available product types based on current filters (progressive filtering)
 */
const getFilteredTypes = async (req, res) => {
  try {
    const { search, district, maxPrice } = req.query;
    
    let pipeline = [];
    
    // Build basic filters (excluding type)
    const matchStage = buildBasicFilters({ search, maxPrice });
    pipeline.push({ $match: matchStage });
    
    // Add farmer lookup
    pipeline.push(...buildFarmerLookupPipeline());
    
    // Apply district filter if provided
    const districtFilter = buildDistrictFilter(district);
    if (districtFilter) {
      pipeline.push(districtFilter);
    }
    
    // Group by type and count
    pipeline.push(
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
      { $sort: { count: -1 } },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0
        }
      }
    );

    const types = await Product.aggregate(pipeline);
    res.json(types);
  } catch (err) {
    console.error("Error fetching filtered types:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

/**
 * Get available product names based on current filters (progressive filtering)
 */
const getFilteredProductNames = async (req, res) => {
  try {
    const { type, district, maxPrice, search } = req.query;
    
    let pipeline = [];
    
    // Build basic filters with partial search for autocomplete
    let matchStage = buildBasicFilters({ type, maxPrice });
    
    // Apply partial search if provided (for autocomplete)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      matchStage.name = { $regex: `^${escapeRegex(searchTerm)}`, $options: "i" };
    }

    pipeline.push({ $match: matchStage });
    
    // Add farmer lookup
    pipeline.push(...buildFarmerLookupPipeline());
    
    // Apply district filter if provided
    const districtFilter = buildDistrictFilter(district);
    if (districtFilter) {
      pipeline.push(districtFilter);
    }
    
    // Group by product name and calculate statistics
    pipeline.push(
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalStock: { $sum: "$quantity" }
        }
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 }, // Limit for performance
      {
        $project: {
          name: "$_id",
          count: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          totalStock: 1,
          _id: 0
        }
      }
    );

    const productNames = await Product.aggregate(pipeline);
    res.json(productNames);
  } catch (err) {
    console.error("Error fetching filtered product names:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

/**
 * Get price range based on current filters (progressive filtering)
 */
const getFilteredPriceRange = async (req, res) => {
  try {
    const { search, type, district } = req.query;
    
    let pipeline = [];
    
    // Build basic filters
    const matchStage = buildBasicFilters({ search, type });
    pipeline.push({ $match: matchStage });
    
    // Add farmer lookup
    pipeline.push(...buildFarmerLookupPipeline());
    
    // Apply district filter if provided
    const districtFilter = buildDistrictFilter(district);
    if (districtFilter) {
      pipeline.push(districtFilter);
    }
    
    // Calculate price statistics
    pipeline.push(
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          minPrice: { $round: ["$minPrice", 2] },
          maxPrice: { $round: ["$maxPrice", 2] },
          avgPrice: { $round: ["$avgPrice", 2] },
          count: 1,
          _id: 0
        }
      }
    );

    const priceRange = await Product.aggregate(pipeline);
    res.json(priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0, count: 0 });
  } catch (err) {
    console.error("Error fetching filtered price range:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

/**
 * Get unique districts from farmers who have products
 */
const getAvailableDistricts = async (req, res) => {
  try {
    const districts = await Product.aggregate([
      // Lookup farmer details
      ...buildFarmerLookupPipeline(),
      
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

/**
 * Get available product types for filtering
 */
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

module.exports = {
  getFilteredDistricts,
  getFilteredTypes,
  getFilteredProductNames,
  getFilteredPriceRange,
  getAvailableDistricts,
  getAvailableTypes
};
