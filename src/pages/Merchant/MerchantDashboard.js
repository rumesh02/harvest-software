import React from "react";
import { Container } from "@mui/material";
import { Routes, Route } from "react-router-dom";
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

const MerchantDashboard = () => {
  return (
    <Container sx={{ flexGrow: 1, p: 3 }}>
      <Routes>
        <Route path="/merchant/dashboard" element={<DashboardHome />} />
        <Route path="/merchant/listings" element={<BrowseListing />} />
        <Route path="/merchant/buy" element={<PlaceBids />} />
        <Route path="/merchant/bids" element={<MyBids />} />
        <Route path="/merchant/purchase-history" element={<PurchaseHistory />} />
        <Route path="/merchant/messages" element={<Messages />} />
        <Route path="/merchant/payments" element={<Payments />} />
      </Routes>
    </Container>
  );
};

export default MerchantDashboard;
