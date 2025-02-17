import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ListNewItem from "./pages/ListNewItem";
import ViewListedItems from "./pages/ViewListedItems.js";
import AcceptRejectBids from "./pages/AcceptRejectBids";
import Messages from "./pages/Messages";
import PaymentApprove from "./pages/PaymentApprove";
import LoginPage from "./app/LoginPage";
import RegisterPage from "./app/RegisterPage";

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
              <Sidebar />
              <div style={{ flexGrow: 1, padding: "20px" }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/list-new-item" element={<ListNewItem />} />
                  <Route path="/view-listed-items" element={<ViewListedItems />} />
                  <Route path="/accept-reject-bids" element={<AcceptRejectBids />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/payment-approve" element={<PaymentApprove />} />
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