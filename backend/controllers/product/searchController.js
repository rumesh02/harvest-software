const Product = require("../../models/Product");
const { escapeRegex } = require("../../utils/productUtils");

/**
 * Get search suggestions for autocomplete
 */
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
                  { 
                    $filter: { 
                      input: "$names", 
                      cond: { 
                        $regexMatch: { 
                          input: "$$this", 
                          regex: `^${escapeRegex(q)}`, 
                          options: "i" 
                        } 
                      } 
                    } 
                  },
                  { 
                    $filter: { 
                      input: "$types", 
                      cond: { 
                        $regexMatch: { 
                          input: "$$this", 
                          regex: `^${escapeRegex(q)}`, 
                          options: "i" 
                        } 
                      } 
                    } 
                  }
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

/**
 * Get popular search terms based on product types and their frequency
 */
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

module.exports = {
  getSearchSuggestions,
  getPopularSearchTerms
};
