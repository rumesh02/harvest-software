// Migration script to add pricePerKm field to existing vehicles
const mongoose = require('mongoose');
const Vehicle = require('./models/vehicleModel');
require('dotenv').config();

const migrateVehicles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/harvest_software');
    console.log('Connected to MongoDB');

    // Find all vehicles without pricePerKm field
    const vehiclesWithoutPrice = await Vehicle.find({
      $or: [
        { pricePerKm: { $exists: false } },
        { pricePerKm: null },
        { pricePerKm: undefined }
      ]
    });

    console.log(`Found ${vehiclesWithoutPrice.length} vehicles without pricePerKm field`);

    if (vehiclesWithoutPrice.length > 0) {
      // Update vehicles to add default pricePerKm value
      const updateResult = await Vehicle.updateMany(
        {
          $or: [
            { pricePerKm: { $exists: false } },
            { pricePerKm: null },
            { pricePerKm: undefined }
          ]
        },
        {
          $set: { pricePerKm: 100.00 } // Default price of LKR 100 per km
        }
      );

      console.log(`Updated ${updateResult.modifiedCount} vehicles with default pricePerKm`);
    }

    // Verify the migration
    const allVehicles = await Vehicle.find({});
    console.log('\nAll vehicles after migration:');
    allVehicles.forEach(vehicle => {
      console.log(`Vehicle ${vehicle.licensePlate}: pricePerKm = ${vehicle.pricePerKm}`);
    });

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateVehicles();
}

module.exports = { migrateVehicles };
