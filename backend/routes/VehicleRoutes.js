const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Setup storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Upload folder (make sure it exists)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique filename with original extension
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
});

// POST route to add vehicle
router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const { vehicleType, licensePlate, loadCapacity } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Vehicle photo is required" });
    }

    // Save to database if needed (you can use Mongoose/MongoDB here)

    console.log({
      vehicleType,
      licensePlate,
      loadCapacity,
      filePath: file.path,
    });

    res.status(200).json({ message: "Vehicle added successfully!" });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
