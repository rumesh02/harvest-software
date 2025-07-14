import React from "react";
import { List, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import { Home, ShoppingCart, MonetizationOn, AssignmentTurnedIn, History, Chat, AccountBalanceWallet, Settings, ExitToApp } from "@mui/icons-material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // Add this import at the top
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";

const menuItems = [
  { text: "Dashboard", icon: <Home />, path: "/merchant/dashboard" },
  { text: "Browse Listing", icon: <ShoppingCart />, path: "/merchant/listings" },
  { text: "Place Bids", icon: <MonetizationOn />, path: "/merchant/buy" },
  { text: "My Bids", icon: <AssignmentTurnedIn />, path: "/merchant/bids" },
  { text: "Purchases", icon: <History />, path: "/merchant/purchase-history" },
  { text: "Messages/Chat", icon: <Chat />, path: "/merchant/messages" },
  { text: "Payments", icon: <AccountBalanceWallet />, path: "/merchant/payments" },
  { text: "Collection", icon: <DirectionsCarIcon />, path: "/merchant/collection" },
  
];

const MerchantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    navigate("/login");
  };

  return (
    <div style={{ width: 250, background: "#f9f9f9", height: "100vh", padding: "20px", borderRadius: "10px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Top Section - Logo and Menu */}
      <div>
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
                "&:hover": { backgroundColor: "#FFF8EC" },
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
      </div>

      {/* Bottom Section - Profile, Settings, Logout, and Confirm Order Button */}
      <div>
        {/* Divider */}
        <hr style={{ margin: "20px 0", border: "1px solid #E5E7EB" }} />

        {/* Profile Section */}
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <Badge overlap="circular" badgeContent={"Merchant"} color="primary">
            <Avatar src={isAuthenticated ? user.picture : "/images/placeholder.svg"} sx={{ width: 56, height: 56, margin: "0 auto" }} />
          </Badge>
          <h4 style={{ marginTop: 10, fontSize: "16px", fontWeight: "bold" }}>{isAuthenticated ? user.name : "Guest"}</h4>
        </div>

        {/* Settings and Logout */}
        <List>
          <ListItemButton component={Link} to="/merchant/settings" sx={{ borderRadius: "8px", marginTop: "10px" }}>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: "8px", marginTop: "5px" }}>
            <ListItemIcon><ExitToApp /></ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItemButton>
        </List>
      </div>
    </div>
  );
};

export default MerchantSidebar;