import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ListNewItem from "./pages/ListNewItem";
import ViewListedItems from "./pages/ViewListedItems.js";
import AcceptRejectBids from "./pages/AcceptRejectBids";
import Messages from "./pages/Messages";
import PaymentApprove from "./pages/PaymentApprove";

const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;
