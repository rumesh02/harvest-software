import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography } from "@mui/material";
import { Dashboard, ShoppingCart, History, Chat, Payment, Settings, ExitToApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const MerchantSidebar = () => {
  const navigate = useNavigate(); // ✅ Navigation Hook

  return (
    <Box sx={{ width: 250, height: "100vh", background: "#F8F8F8", padding: 2 }}>
      {/* Logo & Title */}
      <Typography variant="h6" fontWeight={700} mb={3}>
        🌾 Farm-to-Market
      </Typography>

      {/* Menu List */}
      <List>
        <ListItemButton onClick={() => navigate("/")}>
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/browse-listing")}> {/* ✅ Navigates to Browse Listing */}
          <ListItemIcon><ShoppingCart /></ListItemIcon>
          <ListItemText primary="Browse Listing" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon><History /></ListItemIcon>
          <ListItemText primary="My Bids" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon><Chat /></ListItemIcon>
          <ListItemText primary="Messages/Chat" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon><Payment /></ListItemIcon>
          <ListItemText primary="Payments" />
        </ListItemButton>
      </List>

      {/* User Profile */}
      <Box sx={{ position: "absolute", bottom: 20, left: 20 }}>
        <Avatar src="/images/user.jpg" sx={{ width: 50, height: 50, mb: 1 }} />
        <Typography variant="body1">Sunimal Perera</Typography>
        <Typography variant="caption" color="gray">Merchant</Typography>

        {/* Settings & Logout */}
        <List>
          <ListItemButton>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon><ExitToApp /></ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
};

export default MerchantSidebar;
