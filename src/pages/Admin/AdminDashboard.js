import React, { useEffect, useState } from "react";
import axios from "axios";

const cardStyle = {
  flex: "1 1 200px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "24px",
  margin: "12px",
  textAlign: "center",
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    farmers: 0,
    merchants: 0,
    transporters: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/user-counts");
        setCounts(res.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCounts();
  }, []);

  return (
    <div style={{ padding: "32px" }}>
      
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginTop: "32px",
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <h4>Farmers</h4>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#388e3c",
            }}
          >
            {counts.farmers}
          </p>
        </div>
        <div style={cardStyle}>
          <h4>Merchants</h4>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#1976d2",
            }}
          >
            {counts.merchants}
          </p>
        </div>
        <div style={cardStyle}>
          <h4>Transporters</h4>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#f9a825",
            }}
          >
            {counts.transporters}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;