const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
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
const bidRoutes = require("./routes/bidRoutes");
const productsRoutes = require("./routes/productsRoutes");

app.use("/api/users", userRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/products", productsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));