import React from "react";
import Sidebar from "../components/Sidebar";

const Help = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1, marginTop: "60px", marginLeft: "-220px" }}>
        <h2>Help & Support</h2>
        <p>If you need assistance, check our FAQs or contact support.</p>
      </div>
    </div>
  );
};

export default Help;
