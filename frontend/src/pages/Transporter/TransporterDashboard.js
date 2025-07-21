import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import "./TransporterDashboard.css";
import api from "../../services/api"; // Use your configured axios instance
import { getVehicles } from "../../services/api"; // Import the getVehicles function
import { useAuth0 } from "@auth0/auth0-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransporterDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    monthlyData: [],
    topDrivers: []
  });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || !user.sub) return;
      try {
        const res = await api.get(`/dashboard/transporter/${user.sub}`);
        console.log("Dashboard data:", res.data);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    const fetchVehicleCount = async () => {
      if (!user || !user.sub) return;
      try {
        setLoadingVehicles(true);
        const vehicles = await getVehicles(user.sub);
        setVehicleCount(vehicles.length);
      } catch (err) {
        console.error("Vehicle count fetch error:", err);
        setVehicleCount(0);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchDashboard();
    fetchVehicleCount();
  }, [user]);

  // Prepare chart data
  const chartData = {
    labels: dashboardData.monthlyData.map(m => m.name),
    datasets: [
      {
        label: "Orders",
        data: dashboardData.monthlyData.map(m => m.orders),
        backgroundColor: "#007BFF",
        borderRadius: 5,
        borderSkipped: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="TransporterDashboard-container">
      <h2 className="TransporterDashboard-title">Transporter Dashboard</h2>

      <div className="stats-container" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div className="stats-card" style={{ flex: "1 1 250px", minWidth: 200 }}>
          <h4>Total Bookings</h4>
          <p className="amount">
            {dashboardData.totalBookings !== undefined ? dashboardData.totalBookings : "Loading..."}
          </p>
        </div>
        
        <div className="stats-card" style={{ flex: "1 1 250px", minWidth: 200 }}>
          <h4>Listed Vehicles</h4>
          <p className="amount">
            {loadingVehicles ? "Loading..." : vehicleCount}
          </p>
          {!loadingVehicles && (
            <>
              <small style={{ color: "#666", fontSize: "0.8rem", display: "block", marginTop: "0.5rem" }}>
                Total vehicles registered
              </small>
              <button 
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#007BFF"}
                onClick={() => navigate("/transporter/editListed")}
              >
                Manage Vehicles
              </button>
            </>
          )}
        </div>
      </div>

      <div className="top-drivers-and-chart" style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div className="top-drivers-card" style={{ flex: "1 1 250px", minWidth: 220, background: "#fff", borderRadius: 8, padding: "1rem", marginBottom: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}>
          <h4>Top Drivers</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {dashboardData.topDrivers.length === 0 && <li>No drivers found.</li>}
            {dashboardData.topDrivers.map((driver, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <img
                  src={driver.image || "/placeholder.svg"}
                  alt={driver.name}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", marginRight: 12 }}
                />
                <span>{driver.name}</span>
                <span style={{ marginLeft: "auto", fontWeight: 600, color: "#007BFF" }}>{driver.count} bookings</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="driver-monthly-revenue" style={{ flex: "2 1 400px", minWidth: 300, background: "#fff", borderRadius: 8, padding: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.07)", height: 320 }}>
          <h4>Driver Monthly Orders</h4>
          <div style={{ height: 240 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

function TransporterDashboardWrapper() {
  const { user } = useAuth0();
  return <TransporterDashboard user={user} />;
}

export default TransporterDashboardWrapper;
