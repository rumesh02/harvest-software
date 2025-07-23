// Quick script to check vehicle data and pricePerKm values
const axios = require('axios');

const checkVehiclePrices = async () => {
  try {
    console.log('🔍 Checking vehicle prices...');
    
    // Test the API endpoint
    const response = await axios.get('http://localhost:5000/api/vehicles');
    const vehicles = response.data;
    
    console.log(`Found ${vehicles.length} vehicles`);
    
    if (vehicles.length > 0) {
      console.log('\nVehicle price data:');
      vehicles.forEach((vehicle, index) => {
        console.log(`${index + 1}. ${vehicle.vehicleType} (${vehicle.licensePlate})`);
        console.log(`   Price/km: ${vehicle.pricePerKm || 'NOT SET'}`);
        console.log(`   Has price field: ${vehicle.hasOwnProperty('pricePerKm')}`);
        console.log(`   Price type: ${typeof vehicle.pricePerKm}`);
        console.log('---');
      });
    } else {
      console.log('No vehicles found in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running. Please start it first.');
    }
  }
};

checkVehiclePrices();
