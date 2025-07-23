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

const cardStyle = {
  flex: "1 1 200px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "24px",
  margin: "12px",
  textAlign: "center",
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    farmers: 0,
    merchants: 0,
    transporters: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced stat card data with purple colors
  const getUserStatCards = () => [
    {
      title: "Farmers",
      value: counts.farmers,
      icon: <People fontSize="small" />,
      bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
    },
    {
      title: "Merchants", 
      value: counts.merchants,
      icon: <ShoppingCart fontSize="small" />,
      bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
    },
    {
      title: "Transporters",
      value: counts.transporters,
      icon: <LocalShipping fontSize="small" />,
      bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
    }
  ];

  const getPlatformStatCards = () => {
    if (!analytics) return [];

    return [
      {
        title: "Total Users (excl. Admin)",
        value: analytics.platformStats?.totalUsers || 0,
        icon: <People fontSize="small" />,
        bgColor: "#e1bee7",
        color: "#7b1fa2",
        iconBg: "#ce93d8"
      },
      {
        title: "Successful Deals",
        value: analytics.platformStats?.totalConfirmedBids || 0,
        icon: <TrendingUp fontSize="small" />,
        bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
      },
      {
        title: "Total Listings",
        value: analytics.platformStats?.totalListings || 0,
        icon: <AttachMoney fontSize="small" />,
      bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
      },
      {
        title: "Total Bookings",
        value: analytics.platformStats?.totalBookings || 0,
        icon: <LocalShipping fontSize="small" />,
       bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
      },
      {
        title: "Success Rate",
        value: `${Math.round(((analytics.platformStats?.totalConfirmedBids || 0) / (analytics.platformStats?.totalBookings || 1)) * 100)}%`,
        icon: <Analytics fontSize="small" />,
        bgColor: "#e1bee7",
      color: "#7b1fa2",
      iconBg: "#ce93d8"
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
        maxWidth: '98%', 
        mx: "auto", 
        px: { xs: 0.5, md: 1 }
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
        <Grid container spacing={{ xs: 0.5, md: 0.5 }} sx={{ mb: { xs: 2, md: 4 } }}>
          {getUserStatCards().map((card, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
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
                  minHeight: '120px',
                  width: '100%',
                  mx: 0.5,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(123, 31, 162, 0.13)"
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        color={card.color}
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 1.5, fontSize: { xs: 16, md: 18 } }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        component="div" 
                        sx={{ 
                          fontWeight: 700,
                          color: card.color,
                          fontSize: { xs: 28, md: 32 }
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: card.iconBg,
                        color: card.color,
                        width: { xs: 50, md: 56 },
                        height: { xs: 50, md: 56 },
                        boxShadow: '0 1.5px 6px rgba(123, 31, 162, 0.10)',
                        fontSize: { xs: 26, md: 30 }
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
            <Grid container spacing={{ xs: 1, md: 1 }} sx={{ mb: { xs: 2, md: 4 } }}>
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

            <Grid container spacing={{ xs: 0.2, md: 0.5 }} sx={{ mb: { xs: 2, md: 4 } }}>
              {/* Top Farmers */}
              <Grid item xs={4} md={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 1.5, md: 3 }, 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 0.5, fontSize: { xs: 13, md: 17 } }}>
                        Top Farmers
                      </Typography>
                      <Typography variant="body2" color="#7b1fa2" sx={{ fontSize: { xs: 10, md: 13 } }}>
                        Leading by successful sales
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#ce93d8',
                        color: '#7b1fa2',
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.12)'
                      }}
                    >
                      <People fontSize="small" />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Sales</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topFarmers?.slice(0, 5).map((farmer, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f3e5f5' } }}>
                            <TableCell sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 500, padding: { xs: '4px', md: '8px' } }}>{farmer.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: 11, md: 13 }, padding: { xs: '4px', md: '8px' } }}>
                              <Chip 
                                label={farmer.successfulTransactions} 
                                size="small" 
                                sx={{ bgcolor: '#e1bee7', color: '#7b1fa2', fontWeight: 600, fontSize: { xs: 9, md: 11 } }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 500, padding: { xs: '4px', md: '8px' } }}>
                              RS: {farmer.totalValue?.toFixed(0) || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Top Merchants */}
              <Grid item xs={4} md={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 1.5, md: 3 }, 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 0.5, fontSize: { xs: 13, md: 17 } }}>
                        Top Merchants
                      </Typography>
                      <Typography variant="body2" color="#7b1fa2" sx={{ fontSize: { xs: 10, md: 13 } }}>
                        Leading by purchases
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#ce93d8',
                        color: '#7b1fa2',
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.12)'
                      }}
                    >
                      <ShoppingCart fontSize="small" />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Purchases</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topMerchants?.slice(0, 5).map((merchant, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f3e5f5' } }}>
                            <TableCell sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 500, padding: { xs: '4px', md: '8px' } }}>{merchant.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: 11, md: 13 }, padding: { xs: '4px', md: '8px' } }}>
                              <Chip 
                                label={merchant.successfulTransactions} 
                                size="small" 
                                sx={{ bgcolor: '#e1bee7', color: '#7b1fa2', fontWeight: 600, fontSize: { xs: 9, md: 11 } }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 500, padding: { xs: '4px', md: '8px' } }}>
                              RS: {merchant.totalValue?.toFixed(0) || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Top Drivers */}
              <Grid item xs={4} md={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 1.5, md: 3 }, 
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    border: "1px solid #E5E7EB",
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 0.5, fontSize: { xs: 13, md: 17 } }}>
                        Top Drivers
                      </Typography>
                      <Typography variant="body2" color="#7b1fa2" sx={{ fontSize: { xs: 10, md: 13 } }}>
                        Leading by bookings
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#ce93d8',
                        color: '#7b1fa2',
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.12)'
                      }}
                    >
                      <LocalShipping fontSize="small" />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Name</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Bookings</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#7b1fa2', fontSize: { xs: 10, md: 12 } }}>Clients</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topDrivers?.slice(0, 5).map((driver, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f3e5f5' } }}>
                            <TableCell sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 500, padding: { xs: '4px', md: '8px' } }}>{driver.name}</TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: 11, md: 13 }, padding: { xs: '4px', md: '8px' } }}>
                              <Chip 
                                label={driver.bookingCount} 
                                size="small" 
                                sx={{ bgcolor: '#e1bee7', color: '#7b1fa2', fontWeight: 600, fontSize: { xs: 9, md: 11 } }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 500, padding: { xs: '4px', md: '8px' } }}>
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

            <Grid container spacing={{ xs: 1, md: 1 }}>
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
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 0.5 }}>
                        Product Demand Analytics
                      </Typography>
                      <Typography variant="body2" color="#7b1fa2">
                        Real-time bidding trends and market insights
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        background: '#ce93d8',
                        color: '#7b1fa2',
                        width: 48,
                        height: 48,
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.12)'
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: 14 }}>Product</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: 14 }}>Total Bids</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: 14 }}>Bidders</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: 14 }}>Avg Bid</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.mostDemandedProducts?.slice(0, 5).map((product, index) => (
                          <TableRow 
                            key={index} 
                            sx={{ 
                              '&:hover': { bgcolor: '#f3e5f5' },
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
                                    background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)'
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
                                  bgcolor: '#e1bee7', 
                                  color: '#7b1fa2', 
                                  fontWeight: 600,
                                  fontSize: 12
                                }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 14, fontWeight: 500 }}>
                              {product.uniqueBidders}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 14, fontWeight: 600, color: '#7b1fa2' }}>
                              RS: {product.averageBidAmount?.toFixed(0) || 'N/A'}
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