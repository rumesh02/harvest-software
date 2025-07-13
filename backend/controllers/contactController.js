const ContactMessage = require('../models/ContactMessage');
const { sendEmail, emailTemplates } = require('../config/emailService');

// Submit new contact message
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Create new contact message
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });

    // Save to database
    await contactMessage.save();

    // Send email notification to admin
    const adminEmailResult = await sendEmail(emailTemplates.adminNotification({
      name,
      email,
      message
    }));

    // Send confirmation email to user
    const userEmailResult = await sendEmail(emailTemplates.userConfirmation({
      name,
      email,
      message
    }));

    // Check if emails were sent successfully
    if (!adminEmailResult.success) {
      console.error('Failed to send admin notification:', adminEmailResult.error);
    }

    if (!userEmailResult.success) {
      console.error('Failed to send user confirmation:', userEmailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        id: contactMessage._id,
        emailsSent: {
          adminNotification: adminEmailResult.success,
          userConfirmation: userEmailResult.success
        }
      }
    });

  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error submitting your message. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all contact messages (Admin only)
const getAllContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Get messages with pagination
    const messages = await ContactMessage.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('respondedBy', 'username email');

    // Get total count for pagination
    const totalMessages = await ContactMessage.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page * limit < totalMessages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single contact message by ID
const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id).populate('respondedBy', 'username email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update contact message status (Admin only)
const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.user?.id; // Assuming user ID is available in req.user
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('respondedBy', 'username email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get contact message statistics (Admin only)
const getContactMessageStats = async (req, res) => {
  try {
    const stats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMessages = await ContactMessage.countDocuments();
    const todayMessages = await ContactMessage.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalMessages,
        todayMessages,
        statusBreakdown: {
          new: statusCounts.new || 0,
          read: statusCounts.read || 0,
          replied: statusCounts.replied || 0,
          resolved: statusCounts.resolved || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  getContactMessageStats
};
