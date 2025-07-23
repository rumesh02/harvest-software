import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from "@mui/material";
import {
  TrendingUp,
  People,
  ShoppingCart,
  LocalShipping,
  Analytics,
  Star,
  AttachMoney,
  AdminPanelSettings,
  Dashboard as DashboardIcon
} from "@mui/icons-material";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    farmers: 0,
    merchants: 0,
    transporters: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced stat card data with admin colors
  const getUserStatCards = () => [
    {
      title: "Farmers",
      value: counts.farmers,
      icon: <People fontSize="small" />,
      bgColor: "#e8f5e8",
      color: "#2e7d32",
      iconBg: "#c8e6c9"
    },
    {
      title: "Merchants", 
      value: counts.merchants,
      icon: <ShoppingCart fontSize="small" />,
      bgColor: "#e3f2fd",
      color: "#1565c0",
      iconBg: "#bbdefb"
    },
    {
      title: "Transporters",
      value: counts.transporters,
      icon: <LocalShipping fontSize="small" />,
      bgColor: "#fff8e1",
      color: "#ef6c00",
      iconBg: "#ffcc02"
    }
  ];

  const getPlatformStatCards = () => {
    if (!analytics) return [];
    
    return [
      {
        title: "Total Users (excl. Admin)",
        value: analytics.platformStats?.totalUsers || 0,
        icon: <People fontSize="small" />,
        bgColor: "#e8f5e8",
        color: "#2e7d32",
        iconBg: "#c8e6c9"
      },
      {
        title: "Successful Deals",
        value: analytics.platformStats?.totalConfirmedBids || 0,
        icon: <TrendingUp fontSize="small" />,
        bgColor: "#fce4ec",
        color: "#c2185b",
        iconBg: "#f8bbd9"
      },
      {
        title: "Total Listings",
        value: analytics.platformStats?.totalListings || 0,
        icon: <AttachMoney fontSize="small" />,
        bgColor: "#f3e5f5",
        color: "#7b1fa2",
        iconBg: "#ce93d8"
      },
      {
        title: "Total Bookings",
        value: analytics.platformStats?.totalBookings || 0,
        icon: <LocalShipping fontSize="small" />,
        bgColor: "#fff3e0",
        color: "#ef6c00",
        iconBg: "#ffb74d"
      },
      {
        title: "Success Rate",
        value: `${Math.round(((analytics.platformStats?.totalConfirmedBids || 0) / (analytics.platformStats?.totalBookings || 1)) * 100)}%`,
        icon: <Analytics fontSize="small" />,
        bgColor: "#e1f5fe",
        color: "#0277bd",
        iconBg: "#81d4fa"
      }
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user counts
        const countsRes = await axios.get("http://localhost:5000/api/admin/user-counts");
        setCounts(countsRes.data);
        
        // Fetch analytics data from public endpoint (no authentication needed)
        try {
          const analyticsRes = await axios.get("http://localhost:5000/api/admin/analytics-basic");
          console.log('Analytics response:', analyticsRes.data);
          setAnalytics(analyticsRes.data);
        } catch (analyticsError) {
          console.error('Analytics fetch error:', analyticsError);
          // Don't set error for analytics issues, just log them
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: '#f9f9f9'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#7b1fa2', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Admin Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, background: '#f9f9f9', minHeight: '100vh' }}>
        <Alert 
          severity="error" 
          sx={{
            maxWidth: 600,
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: '#f9f9f9',
      minHeight: "100vh",
      py: 3
    }}>
      <Box sx={{ 
        maxWidth: 1400, 
        mx: "auto", 
        px: { xs: 2, md: 3 }
      }}>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#7b1fa2',
              mb: 0.5,
              fontSize: { xs: 22, md: 24 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 28 }} />
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="#7b1fa2" sx={{ fontWeight: 400, fontSize: { xs: 15, md: 16 } }}>
            Platform analytics and user management
          </Typography>
        </Box>

        {/* User Count Cards */}
        <Grid container spacing={{ xs: 2.5, md: 4 }} sx={{ mb: { xs: 2, md: 4 } }}>
          {getUserStatCards().map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  background: card.bgColor,
                  borderRadius: 3,
                  color: card.color,
                  boxShadow: '0 1.5px 6px rgba(123, 31, 162, 0.07)',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(123, 31, 162, 0.13)"
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        color={card.color}
                        gutterBottom
                        sx={{ fontWeight: 500, mb: 1, fontSize: { xs: 15, md: 16 } }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                          fontWeight: 700,
                          color: card.color,
                          fontSize: { xs: 22, md: 26 }
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: card.iconBg,
                        color: card.color,
                        width: 44,
                        height: 44,
                        boxShadow: '0 1.5px 6px rgba(123, 31, 162, 0.10)',
                        fontSize: 24
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Platform Analytics Section */}
        {analytics && (
          <>
            <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#7b1fa2',
                  mb: 0.5,
                  fontSize: { xs: 18, md: 20 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Analytics sx={{ fontSize: 24 }} />
                Platform Analytics
              </Typography>
              <Typography variant="body2" color="#7b1fa2" sx={{ fontWeight: 400, fontSize: { xs: 13, md: 14 } }}>
                Real-time platform performance metrics
              </Typography>
            </Box>

            {/* Platform Statistics Cards */}
            <Grid container spacing={{ xs: 2.5, md: 4 }} sx={{ mb: { xs: 2, md: 4 } }}>
              {getPlatformStatCards().map((card, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      background: card.bgColor,
                      borderRadius: 3,
                      color: card.color,
                      boxShadow: '0 1.5px 6px rgba(123, 31, 162, 0.07)',
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: 'relative',
                      overflow: 'hidden',
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 16px rgba(123, 31, 162, 0.13)"
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 2.5 }, pt: { xs: 2.5, md: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="subtitle2" 
                            color={card.color}
                            gutterBottom
                            sx={{ fontWeight: 500, mb: 1, fontSize: { xs: 13, md: 14 } }}
                          >
                            {card.title}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              fontWeight: 700,
                              color: card.color,
                              fontSize: { xs: 18, md: 22 }
                            }}
                          >
                            {card.value}
                          </Typography>
                        </Box>
                        <Avatar 
                          sx={{ 
                            background: card.iconBg,
                            color: card.color,
                            width: 36,
                            height: 36,
                            boxShadow: '0 1.5px 6px rgba(123, 31, 162, 0.10)',
                            fontSize: 20
                          }}
                        >
                          {card.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Top Performers Section - Enhanced */}
            <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#7b1fa2',
                  mb: 0.5,
                  fontSize: { xs: 18, md: 20 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Star sx={{ fontSize: 24 }} />
                Top Performers
              </Typography>
              <Typography variant="body2" color="#7b1fa2" sx={{ fontWeight: 400, fontSize: { xs: 13, md: 14 } }}>
                Leading users across all categories
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2.5, md: 4 }} sx={{ mb: { xs: 2, md: 4 } }}>
              {/* Top Farmers */}
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                        Top Farmers
                      </Typography>
                      <Typography variant="body2" color="#2e7d32" sx={{ fontSize: { xs: 12, md: 13 } }}>
                        Leading by successful sales
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#c8e6c9',
                        color: '#2e7d32',
                        width: 40,
                        height: 40,
                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.12)'
                      }}
                    >
                      <People fontSize="small" />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#2e7d32', fontSize: 12 }}>Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#2e7d32', fontSize: 12 }}>Sales</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#2e7d32', fontSize: 12 }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topFarmers?.slice(0, 5).map((farmer, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f1f8e9' } }}>
                            <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{farmer.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: 13 }}>
                              <Chip 
                                label={farmer.successfulTransactions} 
                                size="small" 
                                sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', fontWeight: 600 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 13, fontWeight: 500 }}>
                              ₹{farmer.totalValue?.toFixed(0) || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Top Merchants */}
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                        Top Merchants
                      </Typography>
                      <Typography variant="body2" color="#1565c0" sx={{ fontSize: { xs: 12, md: 13 } }}>
                        Leading by purchases
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#bbdefb',
                        color: '#1565c0',
                        width: 40,
                        height: 40,
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.12)'
                      }}
                    >
                      <ShoppingCart fontSize="small" />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#1565c0', fontSize: 12 }}>Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#1565c0', fontSize: 12 }}>Purchases</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#1565c0', fontSize: 12 }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topMerchants?.slice(0, 5).map((merchant, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#e3f2fd' } }}>
                            <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{merchant.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: 13 }}>
                              <Chip 
                                label={merchant.successfulTransactions} 
                                size="small" 
                                sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 13, fontWeight: 500 }}>
                              ₹{merchant.totalValue?.toFixed(0) || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Top Drivers */}
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef6c00', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                        Top Drivers
                      </Typography>
                      <Typography variant="body2" color="#ef6c00" sx={{ fontSize: { xs: 12, md: 13 } }}>
                        Leading by bookings
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#ffcc02',
                        color: '#ef6c00',
                        width: 40,
                        height: 40,
                        boxShadow: '0 2px 8px rgba(239, 108, 0, 0.12)'
                      }}
                    >
                      <LocalShipping fontSize="small" />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#ef6c00', fontSize: 12 }}>Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#ef6c00', fontSize: 12 }}>Bookings</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#ef6c00', fontSize: 12 }}>Clients</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topDrivers?.slice(0, 5).map((driver, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#fff8e1' } }}>
                            <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{driver.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: 13 }}>
                              <Chip 
                                label={driver.bookingCount} 
                                size="small" 
                                sx={{ bgcolor: '#fff3e0', color: '#ef6c00', fontWeight: 600 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 13, fontWeight: 500 }}>
                              {driver.merchantCount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Most Demanded Products Section - Enhanced */}
            <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#7b1fa2',
                  mb: 0.5,
                  fontSize: { xs: 18, md: 20 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <AttachMoney sx={{ fontSize: 24 }} />
                Most Demanded Products
              </Typography>
              <Typography variant="body2" color="#7b1fa2" sx={{ fontWeight: 400, fontSize: { xs: 13, md: 14 } }}>
                Products with highest bidding activity
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2.5, md: 4 }}>
              <Grid item xs={12}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50', mb: 0.5 }}>
                        Product Demand Analytics
                      </Typography>
                      <Typography variant="body2" color="#4caf50">
                        Real-time bidding trends and market insights
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#c8e6c9',
                        color: '#4caf50',
                        width: 48,
                        height: 48,
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.12)'
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#4caf50', fontSize: 14 }}>Product</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#4caf50', fontSize: 14 }}>Total Bids</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#4caf50', fontSize: 14 }}>Bidders</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#4caf50', fontSize: 14 }}>Avg Bid</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.mostDemandedProducts?.slice(0, 5).map((product, index) => (
                          <TableRow 
                            key={index} 
                            sx={{ 
                              '&:hover': { bgcolor: '#f1f8e9' },
                              '&:nth-of-type(even)': { bgcolor: '#fafafa' }
                            }}
                          >
                            <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #4caf50, #8bc34a)'
                                  }}
                                />
                                {product._id}
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 14 }}>
                              <Chip 
                                label={product.totalBids} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#e8f5e8', 
                                  color: '#2e7d32', 
                                  fontWeight: 600,
                                  fontSize: 12
                                }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 14, fontWeight: 500 }}>
                              {product.uniqueBidders}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 14, fontWeight: 600, color: '#4caf50' }}>
                              ₹{product.averageBidAmount?.toFixed(0) || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;