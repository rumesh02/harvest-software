// src/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

import AuthWrapper from "./components/AuthWrapper";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import FarmerLayout from "./layouts/FarmerLayout";
import MerchantLayout from "./layouts/MerchantLayout";
import TransporterLayout from "./layouts/TransporterLayout";
import { CartProvider } from "./context/CartContext";

// Farmer Pages
import Dashboard from "./pages/Farmer/Dashboard";
import ListNewItem from "./pages/Farmer/ListNewItem";
import ViewListedItems from "./pages/Farmer/ViewListedItems";
import AcceptRejectBids from "./pages/Farmer/AcceptRejectBids";
import Messages from "./pages/Farmer/Messages";
import OrderPage from "./pages/Farmer/Order";

// Merchant Pages
import MerchantDashboard from "./pages/Merchant/MerchantDashboard";
import MerchantBrowseListing from "./pages/Merchant/BrowseListing";
import MerchantBuy from "./pages/Merchant/PlaceBids";
import MerchantBids from "./pages/Merchant/MyBids";
import MerchantPurchaseHistory from "./pages/Merchant/PurchaseHistory";
import MerchantMessages from "./pages/Merchant/Messages";
import MerchantPayments from "./pages/Merchant/Payments";
import FindVehicles from "./pages/Merchant/FindVehicles";

// Transporter Pages
import TransporterDashboard from "./pages/Transporter/TransporterDashboard";
import Bookings from "./pages/Transporter/Bookings";
import AddVehicle from "./pages/Transporter/AddVehicle";
import Inbox from "./pages/Transporter/Inbox";
import EditListed from "./pages/Transporter/EditListed";

// Admin Pages
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import FarmerList from "./pages/Admin/FarmerList";
import MerchantList from "./pages/Admin/MerchantList";
import TransporterList from "./pages/Admin/TransporterList";

// General Pages
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Help from "./pages/Help";
import HomePage from "./pages/HOME/HomePage";
import AboutUs from "./pages/HOME/AboutUs";
import LoginPage from "./app/LoginPage";
import RegisterPage from "./app/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

// Legal Pages
import TermsOfService from "./pages/Legal/TermsOfService";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";

import FarmerSidebar from "./components/Sidebar";
import TransporterSidebar from "./components/TransporterSidebar";
import MerchantSidebar from "./components/Merchantsidebar";

const domain = "dev-loobtzocpv0sh4ny.us.auth0.com";
const clientId = "TteW47136eGLVWWVHIFxAiViqCnittRm";



// ✅ Auth0 Provider Wrapper
const Auth0ProviderWithRedirect = ({ children }) => {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

// ✅ Main Routes
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole && location.pathname === "/") {
      if (userRole === "merchant") {
        window.location.href = "/merchant/dashboard";
      } else if (userRole === "transporter") {
        window.location.href = "/transporter/dashboard";
      }
    }
  }, [isAuthenticated, isLoading, userRole, location.pathname]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/help" element={<Help />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Farmer */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRole="farmer">
            <FarmerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="list-new-item" element={<ListNewItem />} />
        <Route path="view-listed-items" element={<ViewListedItems />} />
        <Route path="accept-reject-bids" element={<AcceptRejectBids />} />
        <Route path="messages" element={<Messages />} />
        <Route path="order" element={<OrderPage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="help" element={<Help />} />
      </Route>

      {/* Merchant */}
      <Route
        path="/merchant"
        element={
          <ProtectedRoute allowedRole="merchant">
            <MerchantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MerchantDashboard />} />
        <Route path="listings" element={<MerchantBrowseListing />} />
        <Route path="buy" element={<MerchantBuy />} />
        <Route path="bids" element={<MerchantBids />} />
        <Route path="purchase-history" element={<MerchantPurchaseHistory />} />
        <Route path="messages" element={<MerchantMessages />} />
        <Route path="payments" element={<MerchantPayments />} />
        <Route path="find-vehicles" element={<FindVehicles />} />
      </Route>

      {/* Transporter */}
      <Route
        path="/transporter"
        element={
          <ProtectedRoute allowedRole="transporter">
            <TransporterLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TransporterDashboard />} />
        <Route path="addVehicle" element={<AddVehicle />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="editListed" element={<EditListed />} />
        <Route path="inbox" element={<Inbox />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmers"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <FarmerList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/merchants"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <MerchantList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transporters"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <TransporterList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route path="/profile" element={<ProfilePage SidebarComponent={FarmerSidebar} />} />
      <Route path="/transporter/profile" element={<ProfilePage SidebarComponent={TransporterSidebar} />} />
      <Route path="/merchant/profile" element={<ProfilePage SidebarComponent={MerchantSidebar} />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
};

// ✅ Final App Component (with resolved merge)
const App = () => {
  return (
    <Auth0ProviderWithRedirect>
      <CartProvider>
        <Router>
          <AuthWrapper>
            <AppRoutes />
          </AuthWrapper>
        </Router>
      </CartProvider>
    </Auth0ProviderWithRedirect>
  );
};

export default App;
