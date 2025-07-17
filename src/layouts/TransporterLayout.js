import React from "react";
import { Box } from "@mui/material";
import TransporterSidebar from "../components/TransporterSidebar.js"; // ✅ Transporter Sidebar
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const TransporterLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* ✅ Transporter Sidebar (Only for Transporter Pages) */}
      <TransporterSidebar />

      <Box sx={{ flexGrow: 1, ml: "32px", p: 3 }}>
        <Navbar />
        <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
      </Box>
    </Box>
  );
};

export default TransporterLayout;
