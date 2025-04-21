const Vehicle = require('../models/Vehicle');

const addVehicle = async (req, res) => {
    try {
        const { transporterId, vehicleType, vehicleNumber, Photo , capacity } = req.body;

        const newVehicle = new Vehicle({
            transporterId,
            vehicleType,
            vehicleNumber,
            Photo,
            capacity           
        });

        await newVehicle.save();

        res.status(201).json({ success: true, message: "Vehicle added successfully", vehicle: newVehicle });
    } catch (error) {
        console.error("Error adding vehicle:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

module.exports = { addVehicle };
