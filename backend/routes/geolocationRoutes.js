const express = require("express");
const axios = require("axios");
const router = express.Router();

// Use environment variable for API key
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "YOUR_RESTRICTED_GOOGLE_MAPS_API_KEY";

router.get("/geocode", async (req, res) => {
  const { lat, lng } = req.query;

  // Validate coordinates
  if (!lat || !lng) {
    return res.status(400).json({ 
      error: "Missing coordinates", 
      details: "Both lat and lng parameters are required" 
    });
  }

  // Validate coordinate format
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ 
      error: "Invalid coordinates", 
      details: "Coordinates must be valid numbers" 
    });
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ 
      error: "Coordinates out of range", 
      details: "Latitude must be between -90 and 90, longitude between -180 and 180" 
    });
  }

  // Check if API key is configured
  if (GOOGLE_API_KEY === "YOUR_RESTRICTED_GOOGLE_MAPS_API_KEY") {
    return res.status(500).json({ 
      error: "Google Maps API key not configured", 
      details: "Please set GOOGLE_MAPS_API_KEY environment variable" 
    });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
    );
    const data = response.data;

    console.log("Geocoding API Response:", data); // Log the response

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const address = data.results[0].formatted_address;
      res.status(200).json({ address });
    } else {
      console.error("Geocoding failed:", data);
      res.status(400).json({ 
        error: "Unable to fetch address", 
        details: data.status || "No results found" 
      });
    }
  } catch (err) {
    console.error("Geocoding API Error:", err.response?.data || err.message); // Log the error
    res.status(500).json({ 
      error: "Failed to fetch geolocation data",
      details: err.response?.data || err.message
    });
  }
});

module.exports = router;