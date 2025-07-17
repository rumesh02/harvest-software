const express = require('express');
const router = express.Router();
const Emoji = require('../models/Emoji');

// Get all emojis with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      search, 
      popular = false 
    } = req.query;

    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter popular emojis
    if (popular === 'true') {
      query.isPopular = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { shortcode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const emojis = await Emoji.find(query)
      .sort({ isPopular: -1, usageCount: -1, shortcode: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Emoji.countDocuments(query);

    res.json({
      success: true,
      emojis,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEmojis: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get emojis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emojis',
      error: error.message
    });
  }
});

// Get emoji categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Emoji.distinct('category');
    
    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Emoji.countDocuments({ category });
        return { category, count };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCount
    });

  } catch (error) {
    console.error('Get emoji categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emoji categories',
      error: error.message
    });
  }
});

// Get popular emojis
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const popularEmojis = await Emoji.find({ isPopular: true })
      .sort({ usageCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      emojis: popularEmojis
    });

  } catch (error) {
    console.error('Get popular emojis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve popular emojis',
      error: error.message
    });
  }
});

// Get recently used emojis (this would typically be user-specific)
router.get('/recent/:userId', async (req, res) => {
  try {
    // This is a placeholder - you'd implement user-specific recent emojis
    // For now, return most used emojis
    const recentEmojis = await Emoji.find()
      .sort({ usageCount: -1 })
      .limit(20);

    res.json({
      success: true,
      emojis: recentEmojis
    });

  } catch (error) {
    console.error('Get recent emojis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent emojis',
      error: error.message
    });
  }
});

// Search emojis
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const emojis = await Emoji.find({
      $or: [
        { shortcode: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .sort({ isPopular: -1, usageCount: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      emojis,
      query: q
    });

  } catch (error) {
    console.error('Search emojis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search emojis',
      error: error.message
    });
  }
});

// Increment emoji usage count
router.post('/use/:emojiId', async (req, res) => {
  try {
    const emoji = await Emoji.findByIdAndUpdate(
      req.params.emojiId,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!emoji) {
      return res.status(404).json({
        success: false,
        message: 'Emoji not found'
      });
    }

    res.json({
      success: true,
      emoji
    });

  } catch (error) {
    console.error('Update emoji usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emoji usage',
      error: error.message
    });
  }
});

// Add custom emoji (admin only)
router.post('/add', async (req, res) => {
  try {
    const {
      unicode,
      shortcode,
      category,
      subcategory,
      description,
      tags,
      skinTones,
      isPopular
    } = req.body;

    // Validate required fields
    if (!unicode || !shortcode || !category || !subcategory || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if emoji already exists
    const existingEmoji = await Emoji.findOne({ unicode });
    if (existingEmoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji already exists'
      });
    }

    const emoji = new Emoji({
      unicode,
      shortcode,
      category,
      subcategory,
      description,
      tags: tags || [],
      skinTones: skinTones || [],
      isPopular: isPopular || false
    });

    await emoji.save();

    res.status(201).json({
      success: true,
      message: 'Emoji added successfully',
      emoji
    });

  } catch (error) {
    console.error('Add emoji error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add emoji',
      error: error.message
    });
  }
});

module.exports = router;
