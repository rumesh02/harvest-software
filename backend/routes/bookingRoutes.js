const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel'); // Adjust path if needed

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      vehicleId,
      transporterId,
      merchantPhone,
      merchantName, // <-- add this
      startLocation,
      endLocation,
      items,
      weight,
    } = req.body;

    if (
      !vehicleId ||
      !transporterId ||
      !merchantPhone ||
      !merchantName || // <-- add this
      !startLocation ||
      !endLocation ||
      !items ||
      weight === undefined ||
      weight === null ||
      isNaN(Number(weight))
    ) {
      return res.status(400).json({ error: "All fields are required and must be valid." });
    }

    const booking = new Booking({
      vehicleId,
      transporterId,
      merchantPhone,
      merchantName, // <-- add this
      startLocation,
      endLocation,
      items,
      weight: Number(weight),
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all bookings for a transporter
router.get('/transporter/:transporterId', async (req, res) => {
  try {
    const bookings = await Booking.find({ transporterId: req.params.transporterId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

module.exports = router;