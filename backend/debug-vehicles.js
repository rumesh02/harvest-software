require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/vehicleModel');

console.log('📡 Connecting to MongoDB Atlas...');
console.log('Database URI:', process.env.MONGO_URI ? 'Found' : 'Missing');

mongoose.connect(process.env.MONGO_URI).then(async () => {
}).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  const vehicles = await Vehicle.find({}).limit(3);
  console.log('\n📋 Vehicle transporterId formats:');
  
  if (vehicles.length === 0) {
    console.log('❌ No vehicles found in database');
  } else {
    vehicles.forEach((vehicle, index) => {
      console.log(`Vehicle ${index + 1}:`);
      console.log(`  - License: ${vehicle.licensePlate}`);
      console.log(`  - TransporterID: ${vehicle.transporterId}`);
      console.log(`  - TransporterID type: ${typeof vehicle.transporterId}`);
      console.log(`  - Starts with 'google-oauth2': ${vehicle.transporterId.startsWith('google-oauth2')}`);
      console.log('---');
    });
  }
  
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
