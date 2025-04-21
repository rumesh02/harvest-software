import React, { useState } from "react";
import "./BookVehicle.css";
import { UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookVehicle = () => {
  const [formData, setFormData] = useState({
    vehicleType: "",
    bookingDate: "",
    timeSlot: "",
    pickupLocation: "",
    dropoffLocation: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Vehicle booked successfully!");
        setFormData({
          vehicleType: "",
          bookingDate: "",
          timeSlot: "",
          pickupLocation: "",
          dropoffLocation: "",
          notes: "",
        });
      } else {
        alert("Failed to book vehicle.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="booking-container">
      <h2>Book a Vehicle</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <label>Vehicle Type</label>
        <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Three-Wheeler">Three-Wheeler</option>
        </select>

        <label>Booking Date</label>
        <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} required />

        <label>Time Slot</label>
        <input type="time" name="timeSlot" value={formData.timeSlot} onChange={handleChange} required />

        <label>Pickup Location</label>
        <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required />

        <label>Drop-off Location</label>
        <input type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} required />

        <label>Additional Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />

        <button type="submit">Book Vehicle</button>
      </form>
    </div>
  );
};

export default BookVehicle;
