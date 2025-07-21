import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar"; // ✅ Farmer Sidebar
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const FarmerLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* ✅ Farmer Sidebar (Fixed Position) */}
      <Sidebar />

      {/* Main Content Area */}
      <Box sx={{ 
        marginLeft: "250px", // Account for fixed sidebar width (adjusted to match standard width)
        minHeight: "100vh",
        background: "#ffffff"
      }}>
        <Box sx={{ p: 3 }}>
          <Navbar />
        </Box>
        <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
      </Box>
    </Box>
  );
};

export default FarmerLayout;
