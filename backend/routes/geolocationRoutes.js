const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_API_KEY = "YOUR_RESTRICTED_GOOGLE_MAPS_API_KEY";

router.get("/geocode", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );
    const data = response.data;

    console.log("Geocoding API Response:", data); // Log the response

    if (data.status === "OK") {
      const address = data.results[0].formatted_address;
      res.status(200).json({ address });
    } else {
      res.status(400).json({ error: "Unable to fetch address", details: data });
    }
  } catch (err) {
    console.error("Geocoding API Error:", err); // Log the error
    res.status(500).json({ error: "Failed to fetch geolocation data" });
  }
});

module.exports = router;