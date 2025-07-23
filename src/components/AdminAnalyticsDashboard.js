import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminAnalyticsDashboard.css';

const AdminAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAnalyticsData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      if (error.response?.status === 401) {
        setError('Unauthorized access. Please login as admin.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load analytics data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const StatCard = ({ title, value, icon, subtitle }) => (
    <div className="card purple-card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-purple fw-bold mb-1">{value}</h4>
            <h6 className="card-title mb-1">{title}</h6>
            {subtitle && (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
          <div className="avatar-purple">
            <i className={`bi ${icon} fs-2`}></i>
          </div>
        </div>
      </div>
    </div>
  );

  const TopPerformerCard = ({ title, data, icon, type }) => (
    <div className="card purple-card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="avatar-purple me-3">
            <i className={`bi ${icon}`}></i>
          </div>
          <h6 className="text-purple fw-bold mb-0">{title}</h6>
        </div>
        
        {data && data.length > 0 ? (
          <div>
            {data.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">
                    {index + 1}. {item[`${type}Name`] || 'Unknown'}
                  </span>
                  <span className="badge purple-badge">
                    {item.totalTransactions || item.totalBookings} {type === 'transporter' ? 'bookings' : 'transactions'}
                  </span>
                </div>
                <div className="progress purple-progress">
                  <div 
                    className="progress-bar" 
                    style={{
                      width: `${((item.totalTransactions || item.totalBookings) / (data[0].totalTransactions || data[0].totalBookings)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No data available</p>
        )}
      </div>
    </div>
  );

  const ProductDemandTable = ({ products }) => (
    <div className="card purple-card">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-cart3 text-purple me-2"></i>
          <h6 className="text-purple fw-bold mb-0">Most Demanded Products</h6>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th className="text-purple fw-bold">Rank</th>
                <th className="text-purple fw-bold">Product Name</th>
                <th className="text-center text-purple fw-bold">Total Bids</th>
                <th className="text-center text-purple fw-bold">Accepted Bids</th>
                <th className="text-center text-purple fw-bold">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product, index) => {
                  const successRate = product.totalBids > 0 
                    ? ((product.acceptedBids / product.totalBids) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          {index < 3 && <i className="bi bi-star-fill text-purple me-2"></i>}
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium">{product.productName}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge purple-badge">{product.totalBids}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge purple-badge-light">{product.acceptedBids}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${successRate > 70 ? 'purple-badge-dark' : successRate > 40 ? 'purple-badge' : 'purple-badge-light'}`}>
                          {successRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-purple" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="mt-3">Loading Analytics...</h6>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-3">
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          {error}
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={fetchAnalytics}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Admin Analytics Dashboard</h2>
          <p className="text-muted mb-0">
            Comprehensive insights into platform performance and user activity
          </p>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={fetchAnalytics}
          title="Refresh Data"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      {/* Platform Statistics */}
      {analyticsData?.platformStats && (
        <>
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-graph-up text-purple me-2 fs-5"></i>
            <h5 className="fw-bold mb-0">Platform Overview</h5>
          </div>
          
          <div className="row g-2 mb-4 platform-stats">
            <div className="col-12 col-sm-6 col-md-2">
              <StatCard
                title="Total Users"
                value={analyticsData.platformStats.totalUsers}
                icon="bi-people"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <StatCard
                title="Total Products"
                value={analyticsData.platformStats.totalProducts}
                icon="bi-box-seam"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <StatCard
                title="Total Bids"
                value={analyticsData.platformStats.totalBids}
                icon="bi-graph-up-arrow"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <StatCard
                title="Accepted Bids"
                value={analyticsData.platformStats.acceptedBids}
                icon="bi-star"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <StatCard
                title="Success Rate"
                value={`${analyticsData.platformStats.bidAcceptanceRate}%`}
                icon="bi-speedometer2"
                subtitle="Bid acceptance rate"
              />
            </div>
          </div>
        </>
      )}

      <hr className="my-4" />

      {/* Top Performers */}
      <div className="d-flex align-items-center mb-3">
        <i className="bi bi-star text-purple me-2 fs-5"></i>
        <h5 className="fw-bold mb-0">Top Performers</h5>
      </div>
      
      <div className="row g-1 mb-4">
        <div className="col-12 col-md-4">
          <TopPerformerCard
            title="Top Farmers"
            data={analyticsData?.topPerformers?.farmers}
            icon="bi-box-seam"
            type="farmer"
          />
        </div>
        <div className="col-12 col-md-4">
          <TopPerformerCard
            title="Top Merchants"
            data={analyticsData?.topPerformers?.merchants}
            icon="bi-shop"
            type="merchant"
          />
        </div>
        <div className="col-12 col-md-4">
          <TopPerformerCard
            title="Top Transporters"
            data={analyticsData?.topPerformers?.transporters}
            icon="bi-truck"
            type="transporter"
          />
        </div>
      </div>

      {/* Product Demand Analysis */}
      <div className="d-flex align-items-center mb-3">
        <i className="bi bi-cart3 text-purple me-2 fs-5"></i>
        <h5 className="fw-bold mb-0">Product Demand Analysis</h5>
      </div>
      
      <ProductDemandTable products={analyticsData?.mostDemandedProducts} />

      {/* Footer */}
      {lastUpdated && (
        <div className="text-center mt-4">
          <small className="text-muted">
            Last updated: {lastUpdated.toLocaleString()}
          </small>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsDashboard;