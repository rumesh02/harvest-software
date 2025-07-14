import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getBookingsForTransporter } from "../../services/api";
import "./Bookings.css";

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
          <h3>Merchant: {booking.merchantName}</h3>
          <h4>Phone: {booking.merchantPhone}</h4>
          <div className="booking-info">
            <p>
              {booking.startLocation} → {booking.endLocation}
            </p>
            <p>
              Items: {booking.items} | Weight: {booking.weight}Kg
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bookings;
