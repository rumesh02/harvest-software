import React, { useState, useEffect } from "react";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Home, Gavel, Settings, ExitToApp, MessageRounded } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { PenFill, PlusCircleFill } from "react-bootstrap-icons";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import "./TransporterSidebar.css";

const menuItems = [
  { text: "Dashboard", icon: <Home />, path: "dashboard" },
  { text: "Add New", icon: <PlusCircleFill />, path: "addVehicle" },
  { text: "Bookings", icon: <Gavel />, path: "bookings" },
  { text: "Edit Listed", icon: <PenFill />, path: "editListed" },
  { text: "Go to Inbox", icon: <MessageRounded />, path: "inbox" }
];

const TransporterSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth0();
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

  const profilePicture =
    isAuthenticated && profile.picture
      ? profile.picture
      : "/placeholder.svg";

  return (
    <div className="transporter-sidebar">
      {/* Logo and Title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "30px"
      }}>
        <img src="/NewLogo.png" alt="Logo" width={30} height={30} />
        <h2 style={{
          fontSize: "16px",
          fontWeight: "bold",
          margin: 0,
          color: "#333"
        }}>Farm-to-Market</h2>
      </div>

      {/* Menu List */}
      <List sx={{ padding: 0, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              borderRadius: "8px",
              marginBottom: "8px",
              padding: "8px 12px",
              backgroundColor: location.pathname.includes(item.path) ? "rgba(13, 110, 253, 0.1)" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                color: "#0d6efd"
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname.includes(item.path) ? "#0d6efd" : "#6B7280",
                minWidth: "36px"
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname.includes(item.path) ? "500" : "normal",
                color: location.pathname.includes(item.path) ? "#0d6efd" : "#374151",
                fontSize: "14px"
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Divider */}
      <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #E5E7EB" }} />

      {/* Profile Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 0",
          marginBottom: "15px",
          cursor: "pointer"
        }}
        onClick={() => navigate("/transporter/profile")}
      >
        <Avatar
          src={profilePicture}
          sx={{
            width: 40,
            height: 40,
            marginRight: "10px"
          }}
        />
        <div>
          <h4 style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "500",
            color: "#333"
          }}>
            {user?.name}
          </h4>
          <span style={{
            fontSize: "12px",
            color: "#6B7280",
            display: "block"
          }}>
            <Badge
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "10px",
                  height: "18px",
                  minWidth: "18px",
                  padding: "0 6px"
                }
              }}
              color="primary"
              badgeContent="Transporter"
            />
          </span>
        </div>
      </div>

      {/* Settings and Logout */}
      <List sx={{ padding: 0 }}>
        <ListItemButton 
          component={Link}
          to="/transporter/profile"
          sx={{ 
            borderRadius: "8px", 
            padding: "8px 12px",
            "&:hover": { 
              backgroundColor: "rgba(13, 110, 253, 0.1)",
              color: "#0d6efd"
            },
          }}
        >
          <ListItemIcon sx={{ color: "#6B7280", minWidth: "36px" }}>
            <Settings />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            primaryTypographyProps={{
              fontSize: "14px",
              color: "#374151"
            }}
          />
        </ListItemButton>
        <ListItemButton 
          sx={{ 
            borderRadius: "8px", 
            padding: "8px 12px",
            "&:hover": { 
              backgroundColor: "rgba(13, 110, 253, 0.1)",
              color: "#0d6efd"
            },
          }} 
          onClick={() => logout({ returnTo: window.location.origin })}>
          <ListItemIcon sx={{ color: "#6B7280", minWidth: "36px" }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText 
            primary="Log Out" 
            primaryTypographyProps={{
              fontSize: "14px",
              color: "#374151"
            }}
          />
        </ListItemButton>
      </List>
    </div>
  );
};

export default TransporterSidebar;