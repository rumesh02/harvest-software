import React from "react";
import { Box } from "@mui/material";
import TransporterSidebar from "../components/TransporterSidebar.js"; // ✅ Transporter Sidebar
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const TransporterLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* ✅ Transporter Sidebar (Fixed Position) */}
      <Box sx={{ 
        position: "fixed",
        top: 0,
        left: 0,
        width: "250px",
        height: "100vh",
        zIndex: 9999,
        overflow: "hidden"
      }}>
        <TransporterSidebar />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        marginLeft: "250px", // Account for fixed sidebar width
        minHeight: "100vh",
        background: "#ffffff"
      }}>
        {/* Fixed Navbar */}
        <Box sx={{ 
          position: "fixed",
          top: 0,
          left: "250px", // Start after the sidebar
          right: 0,
          zIndex: 1000,
          backgroundColor: "#ffffff",
          p: 2, // Reduced padding from 3 to 2
          borderBottom: "1px solid #e0e0e0"
        }}>
          <Navbar />
        </Box>
        
        {/* Scrollable Content Area */}
        <Box sx={{ 
          paddingTop: "80px", // Reduced from 100px to 80px for better spacing
          p: 3 
        }}>
          <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
        </Box>
      </Box>
    </Box>
  );
};

export default TransporterLayout;
