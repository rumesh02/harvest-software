const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel'); // Adjust path if needed
const Notification = require('../models/Notification');

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
    
    // Create notification for transporter about new booking
    try {
      console.log('🚚 Creating transporter notification for new booking...');
      console.log('🚚 Transporter ID from booking:', transporterId);
      console.log('🚚 Transporter ID type:', typeof transporterId);
      console.log('🚚 Merchant details:', { merchantName, merchantPhone });
      console.log('🚚 Booking details:', { startLocation, endLocation, items, weight });
      
      const transporterNotification = new Notification({
        userId: transporterId,
        title: '🚚 New Vehicle Booking!',
        message: `${merchantName} has booked your vehicle for transport from ${startLocation} to ${endLocation}. Items: ${items}, Weight: ${weight}kg`,
        type: 'vehicle_booked',
        relatedId: booking._id.toString(),
        metadata: {
          bookingId: booking._id.toString(),
          merchantName: merchantName,
          vehicleId: vehicleId,
          startLocation: startLocation,
          endLocation: endLocation,
          items: items,
          weight: weight.toString(),
          transporterId: transporterId
        }
      });
      
      console.log('🚚 Notification object before saving:', {
        userId: transporterId,
        title: '🚚 New Vehicle Booking!',
        type: 'vehicle_booked'
      });
      
      const savedTransporterNotification = await transporterNotification.save();
      console.log('✅ Transporter notification created successfully:', savedTransporterNotification);
      console.log('✅ Saved notification userId:', savedTransporterNotification.userId);

      // Emit socket event for real-time notification (if socket.io is available)
      if (req.app.get('io')) {
        const io = req.app.get('io');
        console.log('🔔 Emitting transporter notification via socket for new booking');
        
        io.emit('newNotification', {
          userId: transporterId,
          notification: savedTransporterNotification
        });
        
        console.log('✅ Socket event emitted successfully');
      } else {
        console.log('❌ Socket.io instance not available - notification will only be visible after refresh');
      }
    } catch (notificationError) {
      console.error('❌ Error creating transporter notification for new booking:', notificationError);
      // Don't fail the booking creation if notification creation fails
    }
    
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