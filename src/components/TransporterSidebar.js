import React from "react";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Home, Gavel, Payment, Settings, ExitToApp, MessageRounded } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { PenFill, PlusCircleFill } from "react-bootstrap-icons";

const menuItems = [
  { text: "Dashboard", icon: <Home />, path: "dashboard" },
  { text: "Add New", icon: <PlusCircleFill />, path: "addVehicle" },
  { text: "View Delivery Requests", icon: <Gavel />, path: "bookings" },
  { text: "Edit Listed", icon: <PenFill />, path: "editListed" },
  { text: "Go to Inbox", icon: <MessageRounded />, path: "inbox" },
  { text: "Payment Approve", icon: <Payment />, path: "payments" }
];

const TransporterSidebar = () => {
  const location = useLocation();

  return (
    <div style={{ width: 300, background: "#f9f9f9", height: "100vh", padding: "20px", borderRadius: "10px" }}>
      {/* Logo and Title */}
     <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <img src="/images/logo.png" alt="Logo" width={50} />
      <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Farm-to-Market</h2>
     </div>

      {/* Menu List */}
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              borderRadius: "8px",
              marginBottom: "8px",
              backgroundColor: location.pathname === item.path ? "#FFEDD5" : "transparent",
              "&:hover": { backgroundColor: "#668afa" },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? "#D97706" : "#6B7280" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? "bold" : "normal",
                color: location.pathname === item.path ? "#D97706" : "#374151"
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Divider */}
      <hr style={{ margin: "20px 0", border: "1px solid #E5E7EB" }} />

      {/* Profile Section */}
      <div style={{ textAlign: "center" }}>
        <Badge overlap="circular" badgeContent={"Transporter"} color="primary">
          <Avatar src="/images/nimal.jpg" sx={{ width: 56, height: 56, margin: "0 auto" }} />
        </Badge>
        <h4 style={{ marginTop: 10, fontSize: "16px", fontWeight: "bold" }}>Sunimal Perera</h4>
      </div>

      {/* Settings and Logout */}
      <List>
        <ListItemButton sx={{ borderRadius: "8px", marginTop: "10px" }}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: "8px", marginTop: "5px" }}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItemButton>
      </List>
    </div>
  );
};

export default TransporterSidebar;
