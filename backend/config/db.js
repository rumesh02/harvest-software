//require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI); // Debugging step
    console.log("Attempting to connect to MongoDB...");
    console.log("Database name:", new URL(process.env.MONGO_URI).pathname.substr(1));

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Test the connection by listing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("Available collections:", collections.map((c) => c.name));

    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;