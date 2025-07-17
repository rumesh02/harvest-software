import React from "react";
import { Box } from "@mui/material";
import MerchantSidebar from "../components/Merchantsidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MerchantLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* ✅ Merchant Sidebar (Only for Merchant Pages) */}
      <MerchantSidebar />

      <Box sx={{ flexGrow: 1, ml: "32px", p: 3 }}>
        <Navbar />
        <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
      </Box>
    </Box>
  );
};

export default MerchantLayout;
