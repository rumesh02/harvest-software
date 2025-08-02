// Shared utilities for product operations

/**
 * Escape special regex characters in a string
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build search match stage for MongoDB aggregation
 * @param {string} search - Search term
 * @returns {object} - MongoDB match stage object
 */
function buildSearchMatchStage(search) {
  if (!search || !search.trim()) return {};
  
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
    
    // 5. Description match
    { description: { $regex: escapeRegex(searchTerm), $options: "i" } }
  ];
  
  // Use MongoDB text search for longer searches, regex for shorter
  if (searchTerm.length >= 3) {
    return { $text: { $search: searchTerm } };
  } else {
    return { $or: searchConditions };
  }
}

/**
 * Build basic filters match stage
 * @param {object} filters - Filter parameters
 * @returns {object} - MongoDB match stage object
 */
function buildBasicFilters(filters) {
  const { search, type, maxPrice, productName } = filters;
  let matchStage = {};
  
  // Add search filter
  if (search) {
    Object.assign(matchStage, buildSearchMatchStage(search));
  }
  
  // Add type filter
  if (type && type.trim() && type !== "All Types") {
    matchStage.type = { $regex: `^${escapeRegex(type.trim())}$`, $options: "i" };
  }
  
  // Add price filter
  if (maxPrice) {
    matchStage.price = { $lte: Number(maxPrice) };
  }
  
  // Add product name filter
  if (productName && productName.trim()) {
    matchStage.name = { $regex: productName.trim(), $options: 'i' };
  }
  
  return matchStage;
}

/**
 * Build farmer lookup pipeline
 * @returns {array} - MongoDB aggregation pipeline for farmer lookup
 */
function buildFarmerLookupPipeline() {
  return [
    {
      $lookup: {
        from: "users",
        localField: "farmerID",
        foreignField: "auth0Id",
        as: "farmer"
      }
    },
    { $unwind: { path: "$farmer", preserveNullAndEmptyArrays: true } }
  ];
}

/**
 * Add district filter to pipeline
 * @param {string} district - District name to filter by
 * @returns {object|null} - MongoDB match stage or null
 */
function buildDistrictFilter(district) {
  if (!district || district === "All Districts") return null;
  
  return {
    $match: {
      "farmer.district": { $regex: escapeRegex(district), $options: "i" }
    }
  };
}

/**
 * Build sort options for aggregation
 * @param {object} sortParams - Sort parameters
 * @returns {object} - MongoDB sort object
 */
function buildSortOptions(sortParams) {
  const { sort, sortBy, sortOrder, hasTextSearch } = sortParams;
  
  // Determine sort order
  let sortDirection = 1; // Default ascending
  if (sortOrder) {
    sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
  } else if (sort) {
    sortDirection = sort.toLowerCase() === 'desc' ? -1 : 1;
  }
  
  // Handle sortBy field with minus prefix
  let sortField = sortBy || 'listedDate';
  if (sortField.startsWith('-')) {
    sortField = sortField.substring(1);
    sortDirection = -1;
  }

  const sortOptions = {};
  
  // If using text search, add score sorting for relevance
  if (hasTextSearch) {
    sortOptions.score = { $meta: "textScore" }; // Sort by relevance first
    sortOptions[sortField] = sortDirection; // Then by specified field
  } else {
    sortOptions[sortField] = sortDirection;
  }
  
  return sortOptions;
}

/**
 * Generate unique item code for products
 * @returns {string} - Unique item code in format HVT-YYYY-MM-DD-XXXX
 */
function generateItemCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timeStamp = now.getTime().toString().slice(-4);
  return `HVT-${year}-${month}-${day}-${timeStamp}`;
}

/**
 * Build date grouping for aggregation
 * @param {string} groupBy - Grouping period (day/week/month)
 * @returns {object} - MongoDB date grouping object
 */
function buildDateGrouping(groupBy) {
  switch (groupBy.toLowerCase()) {
    case 'week':
      return {
        year: { $year: "$listedDate" },
        week: { $week: "$listedDate" }
      };
    case 'month':
      return {
        year: { $year: "$listedDate" },
        month: { $month: "$listedDate" }
      };
    default: // 'day'
      return {
        year: { $year: "$listedDate" },
        month: { $month: "$listedDate" },
        day: { $dayOfMonth: "$listedDate" }
      };
  }
}

/**
 * Format period string based on grouping
 * @param {string} groupBy - Grouping period
 * @returns {object} - MongoDB expression for period formatting
 */
function buildPeriodFormatter(groupBy) {
  return {
    $switch: {
      branches: [
        {
          case: { $eq: [groupBy, "week"] },
          then: {
            $concat: [
              { $toString: "$_id.year" },
              "-W",
              { $toString: "$_id.week" }
            ]
          }
        },
        {
          case: { $eq: [groupBy, "month"] },
          then: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          }
        }
      ],
      default: {
        $concat: [
          { $toString: "$_id.year" },
          "-",
          {
            $cond: [
              { $lt: ["$_id.month", 10] },
              { $concat: ["0", { $toString: "$_id.month" }] },
              { $toString: "$_id.month" }
            ]
          },
          "-",
          {
            $cond: [
              { $lt: ["$_id.day", 10] },
              { $concat: ["0", { $toString: "$_id.day" }] },
              { $toString: "$_id.day" }
            ]
          }
        ]
      }
    }
  };
}

/**
 * Validate date parameters for analysis endpoints
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {object} - Validation result with success flag and parsed dates or error
 */
function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return {
      success: false,
      error: 'Both startDate and endDate are required',
      example: 'startDate=2024-01-01&endDate=2024-12-31'
    };
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return {
      success: false,
      error: 'Invalid date format. Use YYYY-MM-DD format'
    };
  }

  if (startDateObj >= endDateObj) {
    return {
      success: false,
      error: 'startDate must be before endDate'
    };
  }

  return {
    success: true,
    startDate: startDateObj,
    endDate: endDateObj
  };
}

module.exports = {
  escapeRegex,
  buildSearchMatchStage,
  buildBasicFilters,
  buildFarmerLookupPipeline,
  buildDistrictFilter,
  buildSortOptions,
  generateItemCode,
  buildDateGrouping,
  buildPeriodFormatter,
  validateDateRange
};
