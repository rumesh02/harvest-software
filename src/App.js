import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FarmerLayout from "./layouts/FarmerLayout";
import MerchantLayout from "./layouts/MerchantLayout";
import TransporterLayout from "./layouts/TransporterLayout";

// Farmer Pages
import Dashboard from "./pages/Farmer/Dashboard";
import ListNewItem from "./pages/Farmer/ListNewItem";
import ViewListedItems from "./pages/Farmer/ViewListedItems";
import AcceptRejectBids from "./pages/Farmer/AcceptRejectBids";
import Messages from "./pages/Farmer/Messages";
import PaymentApprove from "./pages/Farmer/PaymentApprove";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Help from "./pages/Help";

// Merchant Pages
import MerchantDashboard from "./pages/Merchant/MerchantDashboard";
import MerchantBrowseListing from "./pages/Merchant/BrowseListing";
import MerchantBuy from "./pages/Merchant/PlaceBids";
import MerchantBids from "./pages/Merchant/MyBids";
import MerchantPurchaseHistory from "./pages/Merchant/PurchaseHistory";
import MerchantMessages from "./pages/Merchant/Messages";
import MerchantPayments from "./pages/Merchant/Payments";

// Authentication Pages
import LoginPage from "./app/LoginPage";
import RegisterPage from "./app/RegisterPage";

// Home Page
import HomePage from "./pages/HomePage";

// Transporter Pages
import TransporterDashboard from "./pages/Transporter/TransporterDashboard";
import Bookings from "./pages/Transporter/Bookings";
import AddVehicle from "./pages/Transporter/AddVehicle";
import EditListed from "./pages/Transporter/EditListed";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Farmer Routes (Uses FarmerLayout) */}
        <Route path="/" element={<FarmerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="list-new-item" element={<ListNewItem />} />
          <Route path="view-listed-items" element={<ViewListedItems />} />
          <Route path="accept-reject-bids" element={<AcceptRejectBids />} />
          <Route path="messages" element={<Messages />} />
          <Route path="payment-approve" element={<PaymentApprove />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="help" element={<Help />} />
        </Route>

        {/* Merchant Routes (Uses MerchantLayout) */}
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route path="dashboard" element={<MerchantDashboard />} />
          <Route path="listings" element={<MerchantBrowseListing />} />
          <Route path="buy" element={<MerchantBuy />} />
          <Route path="bids" element={<MerchantBids />} />
          <Route path="purchase-history" element={<MerchantPurchaseHistory />} />
          <Route path="messages" element={<MerchantMessages />} />
          <Route path="payments" element={<MerchantPayments />} />
        </Route>

        {/* Home Page Route */}
        <Route path="/homes" element={<HomePage />} />

        {/* Transporter Routes (Uses TransporterLayout) */}
        <Route path="/transporter" element={<TransporterLayout />}>
          <Route path="dashboard" element={<TransporterDashboard />} />
          <Route path="addVehicle" element={<AddVehicle />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="editListed" element={<EditListed />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
