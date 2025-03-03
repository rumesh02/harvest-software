import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar"; // ✅ Farmer Sidebar
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const FarmerLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh"}}>
      {/* ✅ Farmer Sidebar (Only for Farmer Pages) */}
      <Box sx={{ width: "18%" }}>
      <Sidebar />
      </Box>
      

      <Box sx={{ flexGrow: 1, ml: "25px", p: 3 }}>
        <Navbar />
        <Outlet /> {/* ✅ Ensures sub-pages load inside layout */}
      </Box>
    </Box>
  );
};

export default FarmerLayout;
