import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import FarmerLayout from "./layouts/FarmerLayout";
import MerchantLayout from "./layouts/MerchantLayout";
import Dashboard from "./pages/Farmer/Dashboard";
import ListNewItem from "./pages/Farmer/ListNewItem";
import ViewListedItems from "./pages/Farmer/ViewListedItems";
import AcceptRejectBids from "./pages/Farmer/AcceptRejectBids";
import Messages from "./pages/Farmer/Messages";
import PaymentApprove from "./pages/Farmer/PaymentApprove";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Help from "./pages/Help";
import MerchantDashboard from "./pages/Merchant/MerchantDashboard";
import MerchantBrowseListing from "./pages/Merchant/BrowseListing";
import MerchantBuy from "./pages/Merchant/PlaceBids";
import MerchantBids from "./pages/Merchant/MyBids";
import MerchantPurchaseHistory from "./pages/Merchant/PurchaseHistory";
import MerchantMessages from "./pages/Merchant/Messages";
import MerchantPayments from "./pages/Merchant/Payments";
import LoginPage from "./app/LoginPage";
import RegisterPage from "./app/RegisterPage";
import HomePage from "./pages/HomePage";

const domain = "dev-loobtzocpv0sh4ny.us.auth0.com";
const clientId = "TteW47136eGLVWWVHIFxAiViqCnittRm";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  
  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Auth0Provider domain={domain} clientId={clientId} authorizationParams={{ redirect_uri: window.location.origin }}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Farmer Routes */}
          <Route path="/" element={<ProtectedRoute><FarmerLayout /></ProtectedRoute>}>
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

          {/* Redirect home to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </Auth0Provider>
  );
};

export default App;
