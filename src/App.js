import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar"; // ✅ Added Navbar
import Dashboard from "./pages/Dashboard";
import ListNewItem from "./pages/ListNewItem";
import ViewListedItems from "./pages/ViewListedItems.js";
import AcceptRejectBids from "./pages/AcceptRejectBids";
import Messages from "./pages/Messages";
import PaymentApprove from "./pages/PaymentApprove";
import LoginPage from "./app/LoginPage";
import RegisterPage from "./app/RegisterPage";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Help from "./pages/Help";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard and Main App Routes */}
        <Route 
          path="/*" 
          element={
            <div style={{ display: "flex" }}>
              {/* Sidebar (Fixed Width) */}
              <div style={{ width: "250px", height: "100vh", position: "fixed", background: "#f0fdf4" }}>
                <Sidebar />
              </div>

              {/* Main Content (Pushed Right) */}
              <div style={{ flexGrow: 1, marginLeft: "400px", width: "calc(100% - 400px)", padding: "20px" }}>
                <Navbar /> {/* ✅ Added Navbar */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/list-new-item" element={<ListNewItem />} />
                  <Route path="/view-listed-items" element={<ViewListedItems />} />
                  <Route path="/accept-reject-bids" element={<AcceptRejectBids />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/payment-approve" element={<PaymentApprove />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/help" element={<Help />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
