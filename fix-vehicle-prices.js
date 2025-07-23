// Migration script to add pricePerKm to vehicles that don't have it
const mongoose = require('mongoose');

// Define the vehicle schema directly to avoid module issues
const vehicleSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  loadCapacity: {
    type: String,
    required: true,
  },
  pricePerKm: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: false,
  },
  transporterId: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

const fixVehiclePrices = async () => {
  try {
    // Connect to the database
    await mongoose.connect('mongodb://localhost:27017/harvest_software');
    console.log('✅ Connected to MongoDB');

    // Find all vehicles
    const allVehicles = await Vehicle.find({});
    console.log(`Found ${allVehicles.length} vehicles total`);

    // Find vehicles without pricePerKm
    const vehiclesWithoutPrice = await Vehicle.find({
      $or: [
        { pricePerKm: { $exists: false } },
        { pricePerKm: null },
        { pricePerKm: undefined }
      ]
    });

    console.log(`Found ${vehiclesWithoutPrice.length} vehicles without pricePerKm`);

    if (vehiclesWithoutPrice.length > 0) {
      console.log('\nUpdating vehicles with default price...');
      
      const updateResult = await Vehicle.updateMany(
        {
          $or: [
            { pricePerKm: { $exists: false } },
            { pricePerKm: null },
            { pricePerKm: undefined }
          ]
        },
        {
          $set: { pricePerKm: 150.00 } // Default price of LKR 150 per km
        }
      );

      console.log(`✅ Updated ${updateResult.modifiedCount} vehicles with default pricePerKm`);
    }

    // Verify the fix
    console.log('\nVerifying vehicle data:');
    const updatedVehicles = await Vehicle.find({});
    
    updatedVehicles.forEach(vehicle => {
      console.log(`${vehicle.vehicleType} (${vehicle.licensePlate}): pricePerKm = ${vehicle.pricePerKm}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
fixVehiclePrices();
