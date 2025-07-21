import React from "react";
import { Box } from "@mui/material";
import MerchantSidebar from "../components/MerchantSidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MerchantLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* ✅ Merchant Sidebar (Fixed Position) */}
      <MerchantSidebar />

      {/* Main Content Area */}
      <Box sx={{ 
        marginLeft: "250px", // Account for fixed sidebar width
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

export default MerchantLayout;
