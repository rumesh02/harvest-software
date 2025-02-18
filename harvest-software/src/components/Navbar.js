import React from "react";

const Navbar = () => {
  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "#fff", padding: "15px 20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderBottom: "1px solid #ddd"
    }}>
      {/* Left Side: Welcome Message */}
      <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Welcome Back!</h1>

      {/* Right Side: Links */}
      <div style={{ display: "flex", gap: "20px" }}>
        <a href="#" style={{ color: "#555", textDecoration: "none", fontSize: "14px" }}>About</a>
        <a href="#" style={{ color: "#555", textDecoration: "none", fontSize: "14px" }}>Contact Us</a>
        <a href="#" style={{ color: "#555", textDecoration: "none", fontSize: "14px" }}>Help</a>
      </div>
    </nav>
  );
};

export default Navbar;
