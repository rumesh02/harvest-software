const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel'); // Adjust path if needed
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      vehicleId,
      transporterId,
      merchantId, // Add this field
      merchantPhone,
      merchantName,
      startLocation,
      endLocation,
      items,
      weight,
    } = req.body;

    console.log('📦 Booking request received:', {
      vehicleId,
      transporterId,
      merchantId,
      merchantName,
      merchantPhone,
      startLocation,
      endLocation,
      items,
      weight
    });

    if (
      !vehicleId ||
      !transporterId ||
      !merchantId || // Add this validation
      !merchantPhone ||
      !merchantName ||
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
      merchantId, // Add this field
      merchantPhone,
      merchantName,
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
    
    // Populate merchant details from User model for each booking
    const bookingsWithMerchantDetails = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const merchant = await User.findOne({ auth0Id: booking.merchantId });
          return {
            ...booking.toObject(),
            merchantDetails: merchant ? {
              name: merchant.name,
              phone: merchant.phone,
              email: merchant.email,
              address: merchant.address
            } : null
          };
        } catch (error) {
          console.error(`Error fetching merchant details for booking ${booking._id}:`, error);
          return booking.toObject();
        }
      })
    );
    
    res.json(bookingsWithMerchantDetails);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get all bookings for a merchant
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const bookings = await Booking.find({ merchantId: req.params.merchantId });
    
    // Populate transporter details from User model for each booking
    const bookingsWithTransporterDetails = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const transporter = await User.findOne({ auth0Id: booking.transporterId });
          return {
            ...booking.toObject(),
            transporterDetails: transporter ? {
              name: transporter.name,
              phone: transporter.phone,
              email: transporter.email,
              address: transporter.address
            } : null
          };
        } catch (error) {
          console.error(`Error fetching transporter details for booking ${booking._id}:`, error);
          return booking.toObject();
        }
      })
    );
    
    res.json(bookingsWithTransporterDetails);
  } catch (err) {
    console.error('Error fetching merchant bookings:', err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Accept a booking
router.put('/:id/accept', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Update booking status to confirmed
    booking.status = 'confirmed';
    await booking.save();
    
    // Create notification for merchant about booking acceptance
    try {
      const merchantNotification = new Notification({
        userId: booking.merchantId,
        title: '✅ Booking Confirmed!',
        message: `Your vehicle booking has been confirmed by the transporter. Booking ID: ${booking._id}`,
        type: 'booking_confirmed',
        relatedId: booking._id.toString(),
        metadata: {
          bookingId: booking._id.toString(),
          transporterId: booking.transporterId,
          vehicleId: booking.vehicleId,
          status: 'confirmed'
        }
      });
      
      await merchantNotification.save();
      
      // Emit socket event for real-time notification
      if (req.app.get('io')) {
        const io = req.app.get('io');
        io.emit('newNotification', {
          userId: booking.merchantId,
          notification: merchantNotification
        });
      }
    } catch (notificationError) {
      console.error('Error creating merchant notification for booking acceptance:', notificationError);
    }
    
    res.json({ success: true, booking });
  } catch (err) {
    console.error('Error accepting booking:', err);
    res.status(500).json({ error: "Failed to accept booking" });
  }
});

// Reject a booking
router.put('/:id/reject', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    // Create notification for merchant about booking rejection
    try {
      const merchantNotification = new Notification({
        userId: booking.merchantId,
        title: '❌ Booking Rejected',
        message: `Your vehicle booking has been rejected by the transporter. Booking ID: ${booking._id}`,
        type: 'booking_rejected',
        relatedId: booking._id.toString(),
        metadata: {
          bookingId: booking._id.toString(),
          transporterId: booking.transporterId,
          vehicleId: booking.vehicleId,
          status: 'cancelled'
        }
      });
      
      await merchantNotification.save();
      
      // Emit socket event for real-time notification
      if (req.app.get('io')) {
        const io = req.app.get('io');
        io.emit('newNotification', {
          userId: booking.merchantId,
          notification: merchantNotification
        });
      }
    } catch (notificationError) {
      console.error('Error creating merchant notification for booking rejection:', notificationError);
    }
    
    res.json({ success: true, booking });
  } catch (err) {
    console.error('Error rejecting booking:', err);
    res.status(500).json({ error: "Failed to reject booking" });
  }
});

module.exports = router;