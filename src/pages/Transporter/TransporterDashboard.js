import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./TransporterDashboard.css";
import api from "../../services/api"; // Use your configured axios instance
import { useAuth0 } from "@auth0/auth0-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransporterDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    monthlyData: [],
    topDrivers: []
  });

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
    fetchDashboard();
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
