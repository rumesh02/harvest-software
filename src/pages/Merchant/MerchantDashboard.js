import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const MerchantDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    PendingPayments: "Rs. 0",
    PendingBids: 0,
    totalOrders: 0,
    monthlyData: [],
    topFarmers: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth0();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.sub) return;
        
        // Encode the merchantId properly
        const encodedMerchantId = encodeURIComponent(user.sub);
        console.log('Encoded merchant ID:', encodedMerchantId);
        
        const response = await axios.get(
          `http://localhost:5000/api/merchant/dashboard/${encodedMerchantId}`
        );
        
        console.log('Dashboard response:', response.data);
        setDashboardData(response.data);
        
      } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  const { PendingPayments, ActiveBids, totalOrders, monthlyData, topFarmers } = dashboardData;

  return (
    <div className="p-4 bg-white rounded">
      <h4 className="mb-4">Dashboard</h4>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#FFEDD5" }}>
            <h6 className="text-muted">Total Orders</h6>
            <h2 className="text-center my-3">{totalOrders}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#FFEDD5" }}>
            <h6 className="text-muted">Pending Bids</h6>
            <h2 className="text-center my-3">{ActiveBids}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#FFEDD5" }}>
            <h6 className="text-muted">Pending Payments</h6>
            <h2 className="text-center my-3">{PendingPayments}</h2>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="row g-4">
        <div className="col-md-7">
          <div className="bg-white rounded h-100 d-flex flex-column">
            <h5 className="mb-3">Monthly Harvest Purchases</h5>
            <div className="flex-grow-1">
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="revenue" fill="#FFEDD5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="p-3 rounded h-100" style={{ backgroundColor: "#FFEDD5" }}>
            <h5 className="mb-3">Top Farmers</h5>
            <ul className="list-unstyled">
              {topFarmers.map((Farmer, index) => (
                <li
                  key={index}
                  className="d-flex align-items-center py-2"
                >
                  <img
                    src={Farmer.avatar || "/placeholder.svg"}
                    alt={Farmer.name}
                    className="rounded-circle me-3"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <span>{ Farmer.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
