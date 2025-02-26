import React from "react";
import Sidebar from "../components/Sidebar";

const About = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1, marginTop: "60px", marginLeft: "-220px"  }}>
        <h2>About Us</h2>
        <p>Welcome to our platform! Here, we connect farmers with merchants and transporters to create a seamless buying and selling experience.</p>
      </div>
    </div>
  );
};

export default About;
