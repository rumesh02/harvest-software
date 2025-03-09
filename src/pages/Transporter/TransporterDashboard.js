import React from "react";
import "./TransporterDashboard.css";
import transpoter1Image from "../../assets/transporter1.jpeg";
import transpoter2Image from "../../assets/transporter2.jpg";
import transpoter3Image from "../../assets/transporter3.jpg";
import transpoter4Image from "../../assets/transporter4.jpg";

const TransporterDashboard = () => {
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
    </div>
  );
};

export default TransporterDashboard;
