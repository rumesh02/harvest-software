import React from "react";
import { Bar } from "react-chartjs-2"; // Importing Chart.js component
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"; // Import necessary Chart.js components
import "./TransporterDashboard.css";
import transpoter1Image from "../../assets/transporter1.jpeg";
import transpoter2Image from "../../assets/transporter2.jpg";
import transpoter3Image from "../../assets/transporter3.jpg";
import transpoter4Image from "../../assets/transporter4.jpg";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransporterDashboard = () => {
  // Chart data with blue color
  const chartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Orders",
        data: [5, 4, 4, 3, 4, 5, 5, 5, 6, 5, 6, 6], // Sample data
        backgroundColor: "#007BFF", // Blue color
        borderRadius: 5,
        borderSkipped: false
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10000,
        }
      }
    }
  };

  return (
    <div className="TransporterDashboard-container">
      <h2 className="TransporterDashboard-title">Transporter Dashboard</h2>

      <div className="stats-container">
        <div className="stats-card">
          <h4>Revenue This Year</h4>
          <p className="amount">Rs. 425,300</p>
        </div>

        <div className="stats-card">
          <h4>Revenue This Month</h4>
          <p className="amount">Rs. 225,30</p>
        </div>

        <div className="stats-card">
          <h4>Total Bookings</h4>
          <p className="amount">5</p>
        </div>
      </div>

      {/* Container for Top Drivers and Chart in a row */}
      <div className="top-drivers-and-chart">
        <div className="top-drivers-card">
          <h4>Top Drivers</h4>
          <ul>
            <li>
              <img src={transpoter1Image} alt="Nimal Silva" />
              Nimal Silva
            </li>
            <li>
              <img src={transpoter2Image} alt="Arjuna Perera" />
              Arjuna Perera
            </li>
            <li>
              <img src={transpoter3Image} alt="Ajith Bandara" />
              Ajith Bandara
            </li>
            <li>
              <img src={transpoter4Image} alt="Supun Silva" />
              Supun Silva
            </li>
          </ul>
        </div>

        <div className="driver-monthly-revenue">
          <h4>Driver Monthly Orders</h4>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
};

export default TransporterDashboard;
