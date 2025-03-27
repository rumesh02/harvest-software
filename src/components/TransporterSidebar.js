import React from "react";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Home, Gavel, Payment, Settings, ExitToApp, MessageRounded } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { PenFill, PlusCircleFill } from "react-bootstrap-icons";
import { useAuth0 } from "@auth0/auth0-react";

const menuItems = [
  { text: "Dashboard", icon: <Home />, path: "dashboard" },
  { text: "Add New", icon: <PlusCircleFill />, path: "addVehicle" },
  { text: "Bookings", icon: <Gavel />, path: "bookings" },
  { text: "Edit Listed", icon: <PenFill />, path: "editListed" },
  { text: "Go to Inbox", icon: <MessageRounded />, path: "inbox" }, // Updated to include the full path
  { text: "PaymentApproves", icon: <Payment />, path: "payments" } // Updated to include the full path
];

const TransporterSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth0();

  return (
    <div style={{ 
      width: 240, 
      background: "#ffffff", 
      height: "100vh", 
      padding: "20px", 
      borderRadius: "0", 
      boxShadow: "0 0 10px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Logo and Title */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        marginBottom: "30px" 
      }}>
        <img src="/images/logo.png" alt="Logo" width={30} height={30} />
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
            to={item.path}  // Full path provided here
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
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        padding: "10px 0", 
        marginBottom: "15px" 
      }}>
        <Avatar 
          src={user?.picture} 
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
