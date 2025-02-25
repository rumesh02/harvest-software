import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Box, Typography } from "@mui/material";
import { Dashboard, Store, Gavel, History, Chat, Payment, Settings, ExitToApp } from "@mui/icons-material";

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/merchant/dashboard" },
  { text: "Browse Listing", icon: <Store />, path: "/merchant/listings" },
  { text: "Place Bids / Buy Now", icon: <Gavel />, path: "/merchant/buy" },
  { text: "My Bids", icon: <History />, path: "/merchant/bids" },
  { text: "Purchase History", icon: <History />, path: "/merchant/purchase-history" },
  { text: "Messages/Chat", icon: <Chat />, path: "/merchant/messages" },
  { text: "Payments", icon: <Payment />, path: "/merchant/payments" },
];

const MerchantSidebar = ({ setSelectedPage }) => {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,  // ✅ Increased for better spacing
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 260,
          boxSizing: "border-box",
          background: "#FAF3E0",
          position: "fixed", // ✅ Keeps sidebar in place
          height: "100vh", // ✅ Full height
        },
      }}
    >
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Avatar src="/images/merchant.jpg" sx={{ width: 64, height: 64, margin: "auto" }} />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
          Sunimal Perera
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Merchant
        </Typography>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => {
              navigate(item.path);
              if (setSelectedPage) setSelectedPage(item.text);
            }}
            sx={{
              "&:hover": { backgroundColor: "#EFE7DA" }, // ✅ Subtle hover effect
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <List sx={{ position: "absolute", bottom: 0, width: "100%" }}>
        <ListItem button onClick={() => alert("Settings Clicked")}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={() => alert("Logged Out")}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default MerchantSidebar;
