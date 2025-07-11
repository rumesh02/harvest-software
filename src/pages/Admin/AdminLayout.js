import React from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";

const AdminLayout = ({ children }) => (
  <div>
    <Navbar />
    <div style={{ display: "flex" }}>
      <AdminSidebar />
      <div style={{ flex: 1, background: "#f7fbff", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  </div>
);

export default AdminLayout;