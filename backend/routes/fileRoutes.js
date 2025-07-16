const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { uploadSingle, uploadMultiple, getFileCategory, formatFileSize } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Upload single file
router.post('/upload/single', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const fileCategory = getFileCategory(req.file.mimetype);
    const fileUrl = `/uploads/chat-files/${req.file.filename}`;

    // Create file record in database
    const fileRecord = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      category: fileCategory,
      url: fileUrl,
      uploadedBy: userId
    });

    await fileRecord.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileRecord._id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        formattedSize: formatFileSize(fileRecord.size),
        category: fileRecord.category,
        uploadedAt: fileRecord.uploadedAt
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Upload multiple files
router.post('/upload/multiple', uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileCategory = getFileCategory(file.mimetype);
      const fileUrl = `/uploads/chat-files/${file.filename}`;

      const fileRecord = new File({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        category: fileCategory,
        url: fileUrl,
        uploadedBy: userId
      });

      await fileRecord.save();

      uploadedFiles.push({
        id: fileRecord._id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        formattedSize: formatFileSize(fileRecord.size),
        category: fileRecord.category,
        uploadedAt: fileRecord.uploadedAt
      });
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Get file by ID
router.get('/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId).populate('uploadedBy', 'name email');
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        mimetype: file.mimetype,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        category: file.category,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.uploadedAt,
        dimensions: file.dimensions,
        duration: file.duration,
        metadata: file.metadata
      }
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file',
      error: error.message
    });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const filePath = path.join(__dirname, '../uploads/chat-files', file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    res.download(filePath, file.originalName);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
});

// Delete file
router.delete('/:fileId', async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this file'
      });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads/chat-files', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from database
    await File.findByIdAndDelete(req.params.fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

// Get user's uploaded files
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = { uploadedBy: req.params.userId };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const files = await File.find(query)
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'name email');

    const total = await File.countDocuments(query);

    const formattedFiles = files.map(file => ({
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      mimetype: file.mimetype,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      category: file.category,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt,
      dimensions: file.dimensions,
      duration: file.duration
    }));

    res.json({
      success: true,
      files: formattedFiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFiles: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user files',
      error: error.message
    });
  }
});

module.exports = router;
