import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getBookingsForTransporter } from "../../services/api";
import axios from "axios";
import "./Bookings.css";

const Bookings = () => {
  const { user } = useAuth0();
  const [bookings, setBookings] = useState([]);

  // Debug function to check notifications
  const checkNotifications = async () => {
    try {
      const transporterId = user?.sub;
      console.log('🔍 Checking notifications for transporter:', transporterId);
      console.log('🔍 Transporter ID type:', typeof transporterId);
      
      const response = await axios.get(`http://localhost:5000/api/notifications/${transporterId}`);
      console.log('📋 All transporter notifications:', response.data);
      
      const unreadResponse = await axios.get(`http://localhost:5000/api/notifications/unread/${transporterId}`);
      console.log('🔔 Unread count:', unreadResponse.data.unreadCount);
      
      // Show the latest 3 notifications
      const latest = response.data.slice(0, 3);
      console.log('📄 Latest 3 notifications:', latest);
      
      // Check specifically for vehicle bookings
      const vehicleBookings = response.data.filter(n => n.type === 'vehicle_booked');
      console.log('🚚 Vehicle booking notifications:', vehicleBookings);
      
      if (response.data.length === 0) {
        alert(`No notifications found for transporter ID: ${transporterId}. Try booking a vehicle from merchant account first.`);
      } else {
        alert(`Found ${response.data.length} notifications (${unreadResponse.data.unreadCount} unread). Vehicle bookings: ${vehicleBookings.length}. Check console for details.`);
      }
    } catch (error) {
      console.error('❌ Error checking notifications:', error);
      alert('Failed to check notifications');
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await getBookingsForTransporter(user.sub);
      setBookings(data);
    };
    if (user?.sub) fetchBookings();
  }, [user]);

  return (
    <div className="bookings-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Bookings</h2>
        <button 
          onClick={checkNotifications}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Notifications
        </button>
      </div>
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
