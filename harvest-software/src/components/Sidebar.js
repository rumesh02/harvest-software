import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import GavelIcon from "@mui/icons-material/Gavel";
import ChatIcon from "@mui/icons-material/Chat";
import PaymentIcon from "@mui/icons-material/Payment";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { green } from "@mui/material/colors";

const Sidebar = () => {
  const navigate = useNavigate(); // React Router navigation function

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 320,
          boxSizing: "border-box",
          backgroundColor: "#e2f7e5",
          borderRadius: "10px",
          margin: "15px",
          padding: "15px",
        },
      }}
    >
      {/* Logo */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Avatar src="/logo.png" sx={{ width: 50, height: 50 }} />
      </Box>

      {/* Menu Items */}
      <List>
        {[
          { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
          { text: "List New Item", icon: <AddIcon />, path: "/list-new-item" },
          { text: "View Listed Items", icon: <ListIcon />, path: "/view-listed-items" },
          { text: "Accept / Reject Bids", icon: <GavelIcon />, path: "/accept-reject-bids" },
          { text: "Messages", icon: <ChatIcon />, path: "/messages" },
          { text: "Payment Approve", icon: <PaymentIcon />, path: "/payment-approve" },
        ].map((item, index) => (
          <ListItemButton
            key={index}
            sx={{
              borderRadius: "10px",
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              marginBottom: "8px",
              "&:hover": { backgroundColor: "#abf0b5" },
            }}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      {/* User Profile */}
      <Box mt={3} textAlign="center">
        <Avatar src="/farmer.jpg" sx={{ width: 60, height: 60, margin: "auto" }} />
        <Typography fontWeight="bold" mt={1}>
          Sunimal Perera
        </Typography>
        <Typography
          sx={{
            backgroundColor: green[200],
            color: green[900],
            borderRadius: "10px",
            display: "inline-block",
            padding: "2px 10px",
            fontSize: "16px",
          }}
        >
          Farmer
        </Typography>
      </Box>

      {/* Settings & Logout */}
      <List sx={{ position: "absolute", bottom: 20, width: "100%" }}>
        <ListItemButton>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;
