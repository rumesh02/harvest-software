import React from "react";
import "./Bookings.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { getBookingsForTransporter } from "../../services/api"; // Implement this API
import MapWithRoute from "../Map/Map"; // Adjust the import based on your folder structure

const Bookings = () => {
  const { user } = useAuth0();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await getBookingsForTransporter(user.sub);
      setBookings(data);
    };
    if (user?.sub) fetchBookings();
  }, [user]);

  return (
    <div className="bookings-container">
      <h2>Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking._id} className="booking-card">
          <h3>Phone: {booking.merchantPhone}</h3>
          <div className="booking-info">
            <p>{booking.startLocation} → {booking.endLocation}</p>
            <p>Items: {booking.items} | Weight: {booking.weight}Kg</p>
          </div>
          {(typeof booking.startLat === "number" && typeof booking.startLng === "number" &&
            typeof booking.endLat === "number" && typeof booking.endLng === "number") ? (
            <MapWithRoute
              start={{ lat: booking.startLat, lng: booking.startLng }}
              end={{ lat: booking.endLat, lng: booking.endLng }}
            />
          ) : (
            <div>Route map not available</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Bookings;
