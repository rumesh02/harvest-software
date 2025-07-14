const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  getContactMessageStats
} = require('../controllers/contactController');

// Import middleware (assuming you have auth middleware)
// const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public route - Submit contact message
router.post('/submit', submitContactMessage);

// Admin routes (uncomment auth middleware when available)
// router.get('/admin/all', authenticateToken, isAdmin, getAllContactMessages);
// router.get('/admin/stats', authenticateToken, isAdmin, getContactMessageStats);
// router.get('/admin/:id', authenticateToken, isAdmin, getContactMessageById);
// router.put('/admin/:id/status', authenticateToken, isAdmin, updateContactMessageStatus);

// Temporary admin routes without authentication (remove in production)
router.get('/admin/all', getAllContactMessages);
router.get('/admin/stats', getContactMessageStats);
router.get('/admin/:id', getContactMessageById);
router.put('/admin/:id/status', updateContactMessageStatus);

module.exports = router;
