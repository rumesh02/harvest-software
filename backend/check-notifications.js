require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

async function checkNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all notifications
    const allNotifications = await Notification.find({});
    console.log('\n📊 Total notifications in database:', allNotifications.length);
    
    if (allNotifications.length > 0) {
      console.log('\n📋 Recent notifications:');
      allNotifications.slice(0, 5).forEach((notification, index) => {
        console.log(`\nNotification ${index + 1}:`);
        console.log(`  - UserID: ${notification.userId}`);
        console.log(`  - Type: ${notification.type}`);
        console.log(`  - Title: ${notification.title}`);
        console.log(`  - Created: ${notification.createdAt}`);
        console.log(`  - Read: ${notification.isRead}`);
      });
      
      // Check specifically for vehicle_booked notifications
      const vehicleBookings = await Notification.find({ type: 'vehicle_booked' });
      console.log(`\n🚚 Vehicle booking notifications: ${vehicleBookings.length}`);
      
      if (vehicleBookings.length > 0) {
        console.log('\n🚚 Vehicle booking details:');
        vehicleBookings.forEach((notification, index) => {
          console.log(`\nVehicle Booking ${index + 1}:`);
          console.log(`  - TransporterID: ${notification.userId}`);
          console.log(`  - Title: ${notification.title}`);
          console.log(`  - Message: ${notification.message}`);
        });
      }
    } else {
      console.log('❌ No notifications found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNotifications();
