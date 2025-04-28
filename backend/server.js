const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // To serve uploaded images

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save inside uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // get the file extension (.jpg, .png)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// POST route to handle vehicle upload
app.post('/api/vehicles/add', upload.single('file'), (req, res) => {
  try {
    const { vehicleType, licensePlate, loadCapacity } = req.body;
    const filePath = req.file ? req.file.path : null;

    console.log('Vehicle Type:', vehicleType);
    console.log('License Plate:', licensePlate);
    console.log('Load Capacity:', loadCapacity);
    console.log('File Path:', filePath);

    // Now, you can insert vehicleType, licensePlate, loadCapacity, filePath into your database

    res.status(200).json({ message: 'Vehicle added successfully!', filePath });
  } catch (error) {
    console.error('Error saving vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
