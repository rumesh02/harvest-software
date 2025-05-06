import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyData: [],
    totalOrders: 27 // You might want to fetch this separately
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth0();

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/revenue/farmer/${user.sub}`
        );
        setRevenueData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError(error.response?.data?.message || "Failed to load revenue data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub) {
      fetchRevenueData();
    }
  }, [user]);

  return (
    <div className="p-4 bg-white rounded">
      <h4 className="mb-4">Dashboard</h4>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#f1f8e9" }}>
            <h6 className="text-muted">Revenue This Month</h6>
            <h2 className="text-center my-3">Rs. {revenueData.monthlyRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#f1f8e9" }}>
            <h6 className="text-muted">Revenue This Year</h6>
            <h2 className="text-center my-3">Rs. {revenueData.yearlyRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#f1f8e9" }}>
            <h6 className="text-muted">Total Orders</h6>
            <h2 className="text-center my-3">{revenueData.totalOrders}</h2>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="row g-4">
        <div className="col-md-7">
          <div className="bg-white rounded h-100 d-flex flex-column">
            <h5 className="mb-3">Monthly Revenue</h5>
            <div className="flex-grow-1">
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <BarChart data={revenueData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="revenue" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="p-3 rounded h-100" style={{ backgroundColor: "#f1f8e9" }}>
            <h5 className="mb-3">Top Buyers</h5>
            <ul className="list-unstyled">
              {/* Placeholder for top buyers */}
              <li className="d-flex align-items-center py-2">
                <span>No data available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
