import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "../components/Sidebar"; // ✅ Farmer Sidebar
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const FarmerLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* ✅ Farmer Sidebar (Fixed Position) */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "250px",
        height: "100vh",
        zIndex: 9999,
        overflow: "hidden",
        display: { xs: 'none', md: 'block' } // Hide on mobile
      }}>
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        marginLeft: { xs: 0, md: "250px" }, // No margin on mobile, sidebar width on desktop
        minHeight: "100vh",
        background: "#ffffff"
      }}>
        {/* Fixed Navbar */}
        <Box 
          id="navbar-container"
          sx={{ 
            position: "fixed",
            top: 0,
            left: { xs: 0, md: "250px" }, // Full width on mobile, start after sidebar on desktop
            right: 0,
            zIndex: 1000,
            backgroundColor: "#ffffff",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            transition: "all 0.3s ease-in-out"
          }}
        >
          <Navbar />
        </Box>
        
        {/* Scrollable Content Area */}
        <Box sx={{ 
          marginTop: "64px", // Using margin-top instead of padding-top for better spacing
          p: 3 
        }}>
          <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
        </Box>
      </Box>
    </Box>
  );
};

export default FarmerLayout;
