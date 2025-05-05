const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const bidRoutes = require("./routes/bidRoutes");
const productsRoutes = require("./routes/productsRoutes");
const confirmedBidRoutes = require('./routes/confirmedBidRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/products", productsRoutes);
app.use('/api/confirmedbids', confirmedBidRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Test route
app.get("/api/test", (req, res) => {
  res.send("API is working!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Start server with database connection check
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database connection successful');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
