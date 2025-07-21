import React from "react";
import { Box } from "@mui/material";
import TransporterSidebar from "../components/TransporterSidebar.js"; // ✅ Transporter Sidebar
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const TransporterLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh", width: "100%", overflow: "hidden" }}>
      {/* ✅ Transporter Sidebar (Fixed Position) */}
      <TransporterSidebar />

      {/* Main Content Area */}
      <Box sx={{ 
        marginLeft: "250px", // Account for fixed sidebar width
        minHeight: "100vh",
        width: "calc(100% - 250px)",
        background: "#ffffff",
        overflow: "auto"
      }}>
        <Box sx={{ p: 3 }}>
          <Navbar />
        </Box>
        <Box sx={{ p: 3 }}>
          <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
        </Box>
      </Box>
    </Box>
  );
};

export default TransporterLayout;
