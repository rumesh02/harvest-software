const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel'); // Adjust path if needed

// Mock geocode function - replace with real implementation
async function geocodeAddress(address) {
  // This is just a mock. Replace this with actual geocoding logic.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 });
    }, 100);
  });
}

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      vehicleId,
      transporterId,
      merchantPhone,
      startLocation,
      endLocation,
      items,
      weight,
    } = req.body;

    if (
      !vehicleId ||
      !transporterId ||
      !merchantPhone ||
      !startLocation ||
      !endLocation ||
      !items ||
      weight === undefined ||
      weight === null ||
      isNaN(Number(weight))
    ) {
      return res.status(400).json({ error: "All fields are required and must be valid." });
    }

    const startCoords = await geocodeAddress(startLocation);
    const endCoords = await geocodeAddress(endLocation);

    const bookingData = {
      vehicleId,
      transporterId,
      merchantPhone,
      startLocation,
      endLocation,
      items,
      weight: Number(weight),
      startLat: startCoords.lat,
      startLng: startCoords.lng,
      endLat: endCoords.lat,
      endLng: endCoords.lng,
    };

    const booking = new Booking(bookingData);

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get bookings for a specific transporter
router.get('/transporter/:transporterId', async (req, res) => {
  try {
    const bookings = await Booking.find({ transporterId: req.params.transporterId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;