import React from "react";
import Sidebar from "../components/Sidebar";

const ContactUs = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1, marginTop: "60px", marginLeft: "-220px"  }}>
        <h2>Contact Us</h2>
        <p>For any inquiries, please reach out to us at:</p>
        <p>Email: support@harvestplatform.com</p>
        <p>Phone: +94 77 123 4567</p>
      </div>
    </div>
  );
};

export default ContactUs;
