import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import MerchantSidebar from "../../components/MerchantSidebar"; // ✅ Fixed import path
import BrowseListing from "./BrowseListing";
import PlaceBids from "./PlaceBids";
import MyBids from "./MyBids";
import PurchaseHistory from "./PurchaseHistory";
import Messages from "./Messages";
import Payments from "./Payments";

// ✅ Simple Home Component
const DashboardHome = () => {
  return <h2>Welcome to the Merchant Dashboard</h2>;
};

const MerchantDashboardLayout = ({ children }) => {
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const location = useLocation();

  // ✅ Sidebar only appears on merchant pages
  const isMerchantPage = location.pathname.startsWith("/merchant");

  return (
    <Box sx={{ display: "flex" }}>
      {isMerchantPage && <MerchantSidebar setSelectedPage={setSelectedPage} />}
      <Container sx={{ flexGrow: 1, p: 3, ml: isMerchantPage ? "260px" : "0px" }}>
        {children}
      </Container>
    </Box>
  );
};

const MerchantDashboard = () => {
  return (
    <MerchantDashboardLayout>
      <Routes>
        <Route path="/merchant/dashboard" element={<DashboardHome />} /> {/* ✅ No infinite loop */}
        <Route path="/merchant/listings" element={<BrowseListing />} />
        <Route path="/merchant/buy" element={<PlaceBids />} />
        <Route path="/merchant/bids" element={<MyBids />} />
        <Route path="/merchant/purchase-history" element={<PurchaseHistory />} />
        <Route path="/merchant/messages" element={<Messages />} />
        <Route path="/merchant/payments" element={<Payments />} />
      </Routes>
    </MerchantDashboardLayout>
  );
};

export default MerchantDashboard;
