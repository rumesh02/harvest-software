import React from "react";

const Navbar = () => {
  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "#fff", borderRadius: "15px", padding: "20px 40px", boxShadow: "1px 1px 2px 4px rgba(0,0,0,0.1)", borderBottom: "1px solid #ddd"
    }}>
      {/* Left Side: Welcome Message */}
      <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>Welcome Back!</h1>

      {/* Right Side: Links */}
      <div style={{ display: "flex", gap: "80px" }}>
        <a href="/about" style={{ color: "#555", textDecoration: "none", fontSize: "18px" }}>About</a>
        <a href="/contact" style={{ color: "#555", textDecoration: "none", fontSize: "18px" }}>Contact Us</a>
        <a href="/help" style={{ color: "#555", textDecoration: "none", fontSize: "18px" }}>Help</a>
      </div>
    </nav>
  );
};

export default Navbar;
