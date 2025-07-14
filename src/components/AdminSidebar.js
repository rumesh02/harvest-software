import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth0 } from "@auth0/auth0-react";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth0();

  const menuItems = [
    { text: "Admin Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Farmers", icon: <PeopleIcon />, path: "/admin/farmers" },
    { text: "Merchants", icon: <PeopleIcon />, path: "/admin/merchants" },
    { text: "Transporters", icon: <PeopleIcon />, path: "/admin/transporters" },
  ];

  const handleLogout = () => {
    logout({ returnTo: window.location.origin + "/login" });
  };

  return (
    <div style={{
      width: 220,
      background: "#fff",
      height: "100vh",
      padding: "24px 0",
      boxShadow: "0 0 10px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #eee"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "32px",
        paddingLeft: "24px"
      }}>
        <img src="/images/logo.png" alt="Logo" width={32} height={32} />
        <h2 style={{
          fontSize: "17px",
          fontWeight: "bold",
          margin: 0,
          color: "#1976d2"
        }}>Admin Panel</h2>
      </div>
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Link
            key={item.text}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              textDecoration: "none",
              color: location.pathname === item.path ? "#1976d2" : "#333",
              background: location.pathname === item.path ? "rgba(25, 118, 210, 0.08)" : "transparent",
              fontWeight: location.pathname === item.path ? "bold" : "normal",
              borderLeft: location.pathname === item.path ? "4px solid #1976d2" : "4px solid transparent"
            }}
          >
            <span style={{ marginRight: 12 }}>{item.icon}</span>
            {item.text}
          </Link>
        ))}
      </nav>
      {/* Spacer to push logout to bottom */}
      <div style={{ flex: 0.1 }} />
      <div
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 24px",
          cursor: "pointer",
          color: "#333",
          textDecoration: "none",
          marginTop: "auto"
        }}
      >
        <span style={{ marginRight: 12 }}><ExitToAppIcon /></span>
        Log Out
      </div>
    </div>
  );
};

export default AdminSidebar;