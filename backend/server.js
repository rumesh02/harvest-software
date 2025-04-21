const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Default route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ✅ Test API route (ADD THIS HERE)
app.get("/api/test", (req, res) => {
    res.send("API is working!");
});

// Import routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/api/vehicles', vehicleRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



