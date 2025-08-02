const Product = require("../../models/Product");
const { 
  buildSearchMatchStage, 
  buildBasicFilters, 
  buildFarmerLookupPipeline, 
  buildDistrictFilter, 
  buildSortOptions 
} = require("../../utils/productUtils");

/**
 * Fetch all products with backend filtering and pagination using efficient aggregation
 */
const getProducts = async (req, res) => {
  try {
    const { 
      search, 
      district, 
      maxPrice, 
      type, 
      page = 1, 
      limit = 8, 
      sort = 'desc', 
      sortBy = 'listedDate', 
      sortOrder 
    } = req.query;
    
    // Build match stage for MongoDB aggregation
    const matchStage = buildBasicFilters({ search, type, maxPrice });
    const hasTextSearch = !!matchStage.$text;

    // Build sort options
    const sortOptions = buildSortOptions({
      sort,
      sortBy,
      sortOrder,
      hasTextSearch
    });

    const skip = (Number(page) - 1) * Number(limit);

    // Build aggregation pipeline
    const pipeline = [
      // Match basic product filters first
      { $match: matchStage },
      
      // Add text score for sorting if using text search
      ...(hasTextSearch ? [{
        $addFields: { score: { $meta: "textScore" } }
      }] : []),
      
      // Lookup farmer details to get district information
      ...buildFarmerLookupPipeline(),
      
      // Add district filtering if specified
      ...(district && district !== "All Districts" ? [buildDistrictFilter(district)] : []),
      
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
          ...(hasTextSearch ? { score: 1 } : {})
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
      isTextSearch: hasTextSearch
    });
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

module.exports = {
  getProducts
};
