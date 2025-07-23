import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  LocalShipping,
  Agriculture,
  Store,
  Refresh,
  Assessment,
  Star,
  Timeline
} from '@mui/icons-material';
import axios from 'axios';

const AdminAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth implementation
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

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}20, ${color}10)` }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const TopPerformerCard = ({ title, data, icon, color, type }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        
        {data && data.length > 0 ? (
          <Box>
            {data.map((item, index) => (
              <Box key={index} mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" fontWeight="500">
                    {index + 1}. {item[`${type}Name`] || 'Unknown'}
                  </Typography>
                  <Chip 
                    label={`${item.totalTransactions || item.totalBookings} ${type === 'transporter' ? 'bookings' : 'transactions'}`}
                    size="small" 
                    color="primary"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={((item.totalTransactions || item.totalBookings) / (data[0].totalTransactions || data[0].totalBookings)) * 100}
                  sx={{ height: 6, borderRadius: 3, bgcolor: `${color}20` }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No data available</Typography>
        )}
      </CardContent>
    </Card>
  );

  const ProductDemandTable = ({ products }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ShoppingCart sx={{ mr: 1, color: '#ff9800' }} />
          <Typography variant="h6" fontWeight="bold">
            Most Demanded Products
          </Typography>
        </Box>
        
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell align="center"><strong>Total Bids</strong></TableCell>
                <TableCell align="center"><strong>Accepted Bids</strong></TableCell>
                <TableCell align="center"><strong>Success Rate</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product, index) => {
                  const successRate = product.totalBids > 0 
                    ? ((product.acceptedBids / product.totalBids) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {index < 3 && <Star sx={{ color: '#ffd700', mr: 1 }} />}
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="500">
                          {product.productName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={product.totalBids} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={product.acceptedBids} color="success" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${successRate}%`} 
                          color={successRate > 70 ? 'success' : successRate > 40 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No product data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" mt={2}>Loading Analytics...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <IconButton color="inherit" onClick={fetchAnalytics}>
            <Refresh />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into platform performance and user activity
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchAnalytics} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Platform Statistics */}
      {analyticsData?.platformStats && (
        <>
          <Typography variant="h5" fontWeight="bold" mb={2} display="flex" alignItems="center">
            <Assessment sx={{ mr: 1 }} />
            Platform Overview
          </Typography>
          
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Total Users"
                value={analyticsData.platformStats.totalUsers}
                icon={<People />}
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Total Products"
                value={analyticsData.platformStats.totalProducts}
                icon={<Agriculture />}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Total Bids"
                value={analyticsData.platformStats.totalBids}
                icon={<TrendingUp />}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Accepted Bids"
                value={analyticsData.platformStats.acceptedBids}
                icon={<Star />}
                color="#9c27b0"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Success Rate"
                value={`${analyticsData.platformStats.bidAcceptanceRate}%`}
                icon={<Timeline />}
                color="#f44336"
                subtitle="Bid acceptance rate"
              />
            </Grid>
          </Grid>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Top Performers */}
      <Typography variant="h5" fontWeight="bold" mb={2} display="flex" alignItems="center">
        <Star sx={{ mr: 1 }} />
        Top Performers
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <TopPerformerCard
            title="Top Farmers"
            data={analyticsData?.topPerformers?.farmers}
            icon={<Agriculture />}
            color="#4caf50"
            type="farmer"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopPerformerCard
            title="Top Merchants"
            data={analyticsData?.topPerformers?.merchants}
            icon={<Store />}
            color="#2196f3"
            type="merchant"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopPerformerCard
            title="Top Transporters"
            data={analyticsData?.topPerformers?.transporters}
            icon={<LocalShipping />}
            color="#ff9800"
            type="transporter"
          />
        </Grid>
      </Grid>

      {/* Product Demand Analysis */}
      <Typography variant="h5" fontWeight="bold" mb={2} display="flex" alignItems="center">
        <ShoppingCart sx={{ mr: 1 }} />
        Product Demand Analysis
      </Typography>
      
      <ProductDemandTable products={analyticsData?.mostDemandedProducts} />

      {/* Footer */}
      {lastUpdated && (
        <Box mt={3} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated.toLocaleString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminAnalyticsDashboard;