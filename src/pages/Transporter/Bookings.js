import React from "react";
import "./Bookings.css";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const bookings = [
  {
    id: 1,
    name: "Kamal Perera",
    date: "SAT, MAY 11",
    time: "7:00 PM",
    location: "HAYDEN LIBRARY, TEMPE",
  },
  {
    id: 2,
    name: "Sunil Bandara",
    date: "WED, MAY 9",
    time: "6:00 PM",
    location: "HAYDEN LIBRARY, TEMPE",
  },
];

const Bookings = () => {
  return (
    <div className="bookings-container">
      <h2>Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking.id} className="booking-card">
          <h3>{booking.name}</h3>
          <div className="booking-info">
            <p>
              <FaCalendarAlt className="icon" /> {booking.date} {booking.time}
            </p>
            <p>
              <FaMapMarkerAlt className="icon" /> {booking.location}
            </p>
          </div>
          <div className="booking-buttons">
            <button className="details-btn">View Details</button>
            <button className="accept-btn">Accept</button>
            <button className="cancel-btn">Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bookings;
