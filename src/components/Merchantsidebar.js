import React, { useState, useEffect } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Home,
  ShoppingCart,
  MonetizationOn,
  AssignmentTurnedIn,
  History,
  Chat,
  AccountBalanceWallet,
  Settings,
  ExitToApp,
} from "@mui/icons-material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const menuItems = [
  { text: "Dashboard", icon: <Home />, path: "/merchant/dashboard" },
  { text: "Browse Listing", icon: <ShoppingCart />, path: "/merchant/listings" },
  { text: "Place Bids", icon: <MonetizationOn />, path: "/merchant/buy" },
  { text: "My Bids", icon: <AssignmentTurnedIn />, path: "/merchant/bids" },
  { text: "Messages", icon: <Chat />, path: "/merchant/messages" },
  { text: "Payments", icon: <AccountBalanceWallet />, path: "/merchant/payments" },
  { text: "Collection", icon: <DirectionsCarIcon />, path: "/merchant/collection" }, // from your branch
  { text: "Purchase History", icon: <History />, path: "/merchant/purchase-history" },
];

const MerchantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState({ picture: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user?.sub) {
        try {
          const res = await axios.get(`/api/users/${user.sub}`);
          setProfile(res.data);
        } catch {
          setProfile({ picture: "" });
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  const profilePicture = isAuthenticated && profile.picture ? profile.picture : user?.picture || "/images/placeholder.svg";

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    navigate("/login");
  };

  return (
    <div
      style={{
        width: 320,
        background: "#f9f9f9",
        height: "100vh",
        padding: "24px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top Section - Logo and Menu */}
      <div>
        {/* Logo and Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <img src="/images/logo.png" alt="Logo" width={50} />
          <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
            Farm-to-Market
          </h2>
        </div>

        {/* Menu List */}
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: "10px",
                marginBottom: "10px",
                padding: "12px 16px",
                backgroundColor:
                  location.pathname === item.path ? "#FFEDD5" : "transparent",
                "&:hover": { backgroundColor: "#FFF8EC" },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path ? "#D97706" : "#6B7280",
                  minWidth: "48px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight:
                    location.pathname === item.path ? "bold" : "normal",
                  color:
                    location.pathname === item.path ? "#D97706" : "#374151",
                  fontSize: "16px",
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </div>

      {/* Bottom Section - Profile and Settings */}
      <div>
        <hr
          style={{ margin: "24px 0", border: "1px solid #E5E7EB" }}
        />

        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/merchant/profile")}
        >
          <Badge
            overlap="circular"
            badgeContent={"Merchant"}
            color="primary"
          >
            <Avatar
              src={profilePicture}
              sx={{ width: 64, height: 64, margin: "0 auto" }}
            />
          </Badge>
          <h4
            style={{
              marginTop: 12,
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {isAuthenticated ? user.name : "Guest"}
          </h4>
        </div>

        <List>
          <ListItemButton
            component={Link}
            to="/merchant/settings"
            sx={{
              borderRadius: "10px",
              marginTop: "12px",
              padding: "12px 16px",
            }}
          >
            <ListItemIcon sx={{ minWidth: "48px" }}>
              <Settings />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: "16px" }}
            />
          </ListItemButton>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              marginTop: "8px",
              padding: "12px 16px",
            }}
          >
            <ListItemIcon sx={{ minWidth: "48px" }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText
              primary="Log Out"
              primaryTypographyProps={{ fontSize: "16px" }}
            />
          </ListItemButton>
        </List>
      </div>
    </div>
  );
};

export default MerchantSidebar;
