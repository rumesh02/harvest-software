import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider, 
  CircularProgress,
  Alert,
  Button,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton
} from '@mui/material';
import { 
  ShoppingCart as OrdersIcon, 
  Gavel as BidsIcon, 
  AccountBalance as PaymentsIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MerchantDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    PendingPayments: "Rs. 0",
    PendingBids: 0,
    totalOrders: 0,
    monthlyData: [],
    topFarmers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [farmerReviews, setFarmerReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { user } = useAuth0();

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!user?.sub) return;
      
      // First, test if the backend is reachable
      try {
        const testResponse = await axios.get('http://localhost:5000/api/merchant/test');
        console.log('Backend test response:', testResponse.data);
      } catch (testError) {
        console.error('Backend test failed:', testError);
        setError('Backend server is not reachable. Please check if the server is running.');
        setLoading(false);
        return;
      }
      
      // Encode the merchantId properly
      const encodedMerchantId = encodeURIComponent(user.sub);
      
      const url = http://localhost:5000/api/merchant/dashboard/${encodedMerchantId};
      console.log('Fetching dashboard data from:', url);
      
      const response = await axios.get(url);
      
      // Add detailed logging
      console.log('Full dashboard response:', response.data);
      console.log('Monthly data received:', response.data.monthlyData);
      
      setDashboardData(response.data);
      console.log('Dashboard data received:', response.data);
      console.log('Monthly data:', response.data.monthlyData);
      
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to load dashboard data. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.sub]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Function to fetch reviews for a specific farmer
  const fetchFarmerReviews = async (farmerId) => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(http://localhost:5000/api/reviews/farmer/${farmerId});
      setFarmerReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching farmer reviews:', error);
      setFarmerReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle farmer click to open review modal
  const handleFarmerClick = (farmer) => {
    setSelectedFarmer(farmer);
    setReviewModalOpen(true);
    fetchFarmerReviews(farmer._id);
  };

  // Handle closing review modal
  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedFarmer(null);
    setFarmerReviews([]);
  };

  // Format the monthly data to ensure it has proper names and values
  const formattedMonthlyData = (dashboardData.monthlyData || []).map(item => ({
    name: item.name || item.month || '',
    // Try multiple property names that might contain the revenue data
    revenue: typeof item.revenue === 'number' ? item.revenue : 
             typeof item.amount === 'number' ? item.amount :
             typeof item.value === 'number' ? item.value : 0,
  }));

  // After formatting, add a log
  console.log('Formatted monthly data for chart:', formattedMonthlyData);

  const { PendingPayments, PendingBids, totalOrders, topFarmers, monthlyData } = dashboardData;

  // Check if we have any data to display
  const hasData = totalOrders > 0 || PendingBids > 0 || (monthlyData && monthlyData.length > 0);

  // Enhanced stat card data with merchant colors
  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <OrdersIcon fontSize="small" />,
      bgColor: "#fef3e2",
      color: "#92400e"
    },
    {
      title: "Pending Bids",
      value: PendingBids,
      icon: <BidsIcon fontSize="small" />,
      bgColor: "#fef3e2",
      color: "#92400e"
    },
    {
      title: "Pending Payments",
      value: PendingPayments,
      icon: <PaymentsIcon fontSize="small" />,
      bgColor: "#fef3e2",
      color: "#92400e"
    }
  ];

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            padding: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#d97706', fontWeight: 500 }}>
            Purchase Cost: Rs. {payload[0].value?.toLocaleString() || 0}
          </Typography>
        </Box>
      );
    }
    return null;
  };

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
          <CircularProgress size={60} sx={{ color: '#d97706', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Dashboard...
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
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchDashboardData();
              }}
              sx={{ fontWeight: 600 }}
            >
              Retry
            </Button>
          }
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
              color: '#92400e',
              mb: 0.5,
              fontSize: { xs: 22, md: 24 }
            }}
          >
            Merchant Dashboard
          </Typography>
          <Typography variant="body2" color="#92400e" sx={{ fontWeight: 400, fontSize: { xs: 15, md: 16 } }}>
            Track your purchases and business analytics
          </Typography>
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={{ xs: 2.5, md: 4 }} sx={{ mb: { xs: 2, md: 4 } }}>
          {statCards.map((card, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  background: card.bgColor,
                  borderRadius: 3,
                  color: card.color,
                  boxShadow: '0 1.5px 6px rgba(146, 64, 14, 0.07)',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(146, 64, 14, 0.13)"
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        color="#92400e" 
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
                        background: '#fef3e2',
                        color: '#92400e',
                        width: 44,
                        height: 44,
                        boxShadow: '0 1.5px 6px rgba(146, 64, 14, 0.10)',
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

        {/* Enhanced Charts and Lists */}
        {!hasData && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            mb: 4,
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 3,
              background: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography variant="h5" color="#000" gutterBottom sx={{ fontWeight: 600 }}>
              No Data Available Yet
            </Typography>
            <Typography variant="body1" color="#000" sx={{ maxWidth: 400, mx: 'auto' }}>
              Start placing bids on harvests to see your dashboard analytics and track your business growth
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
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
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                    Monthly Purchase Analytics
                  </Typography>
                  <Typography variant="body2" color="#92400e" sx={{ fontSize: { xs: 12, md: 13 } }}>
                    Track your harvest purchase costs over time
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: '#d97706',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
                  }}
                >
                  <TrendingIcon fontSize="small" />
                </Avatar>
              </Box>
              <Box sx={{ height: 240, mt: 1.5 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedMonthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3e2" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#92400e', fontSize: 11, fontWeight: 500 }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: '#d97706', fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#92400e', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(value) => Rs. ${value.toLocaleString()}}
                      label={{ value: 'Purchase Cost (Rs.)', angle: -90, position: 'insideLeft', fill: '#d97706', fontSize: 11 }}
                      ticks={[2500, 5000, 7500, 10000]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="revenue" 
                      fill="#d97706"
                      radius={[5, 5, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {/* Chart legend */}
                <Box sx={{ mt: 0.5, textAlign: 'right' }}>
                  <Typography variant="caption" color="#d97706" sx={{ fontSize: 11 }}>● Purchase Cost</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
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
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                    Top-Rated Farmers
                  </Typography>
                  <Typography variant="body2" color="#92400e" sx={{ fontSize: { xs: 12, md: 13 } }}>
                    Highest rated suppliers on the platform
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: '#d97706',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </Box>
              <Box sx={{ height: 240, mt: 1.5, overflowY: 'auto' }}>
                {topFarmers && topFarmers.length > 0 ? (
                  <List sx={{ width: '100%', p: 0 }}>
                    {topFarmers.map((farmer, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" sx={{ my: 1, bgcolor: '#f3f4f6' }} />}
                        <ListItem 
                          onClick={() => handleFarmerClick(farmer)}
                          sx={{ 
                            px: 0, 
                            py: 1.5, 
                            borderRadius: 2, 
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': { 
                              bgcolor: '#fef3e2',
                              transform: 'translateX(4px)'
                            } 
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 50 }}>
                            <Avatar 
                              src={farmer.avatar || undefined}
                              alt={farmer.name}
                              sx={{ 
                                width: 42, 
                                height: 42, 
                                bgcolor: !farmer.avatar ? '#fed7aa' : undefined,
                                color: '#92400e',
                                fontWeight: 700,
                                fontSize: 16,
                                border: '2px solid #fef3e2',
                                boxShadow: '0 2px 8px rgba(146, 64, 14, 0.1)'
                              }}
                            >
                              {!farmer.avatar && farmer.name ? farmer.name[0].toUpperCase() : null}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            sx={{ flex: 1 }}
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e', fontSize: 14 }}>
                                  {farmer.name}
                                </Typography>
                                {farmer.rating > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <StarIcon sx={{ color: '#fbbf24', fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600, fontSize: 11 }}>
                                      {farmer.rating.toFixed(1)}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="#6b7280" sx={{ display: 'block', fontSize: 11, mb: 0.5 }}>
                                  {farmer.location || "Location not available"}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" color="#92400e" sx={{ fontWeight: 500, fontSize: 11 }}>
                                    {farmer.rating > 0 ? ${farmer.orders} reviews : 'New farmer'}
                                  </Typography>
                                  {farmer.rating > 0 ? (
                                    <Chip
                                      size="small"
                                      label={${farmer.rating.toFixed(1)} ★}
                                      sx={{
                                        background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: 10,
                                        height: 20,
                                        boxShadow: '0 1px 4px rgba(251, 191, 36, 0.3)',
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      size="small"
                                      label="New"
                                      sx={{
                                        background: '#e5e7eb',
                                        color: '#6b7280',
                                        fontWeight: 500,
                                        fontSize: 10,
                                        height: 20,
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    py: 4
                  }}>
                    <PersonIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography color="#6b7280" sx={{ fontWeight: 500, fontSize: 14, mb: 1 }}>
                      No top-rated farmers yet
                    </Typography>
                    <Typography variant="caption" color="#9ca3af" sx={{ fontSize: 12 }}>
                      Farmers will appear here as they receive reviews and ratings
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* Footer info */}
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Typography variant="caption" color="#d97706" sx={{ fontSize: 11 }}>● Top Rated Farmers</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Review Modal */}
      <Dialog 
        open={reviewModalOpen} 
        onClose={handleCloseReviewModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          pb: 1,
          background: 'linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedFarmer && (
              <>
                <Avatar 
                  src={selectedFarmer.avatar || undefined}
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: '#fed7aa',
                    color: '#92400e',
                    fontWeight: 700,
                    fontSize: 20,
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(146, 64, 14, 0.2)'
                  }}
                >
                  {!selectedFarmer.avatar && selectedFarmer.name ? selectedFarmer.name[0].toUpperCase() : null}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#92400e', fontWeight: 700, mb: 0.5 }}>
                    {selectedFarmer.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating 
                      value={selectedFarmer.rating || 0} 
                      readOnly 
                      size="small"
                      sx={{ color: '#fbbf24' }}
                    />
                    <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                      {selectedFarmer.rating ? selectedFarmer.rating.toFixed(1) : 'No rating'}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          <IconButton
            onClick={handleCloseReviewModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#92400e',
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 2 }}>
          {reviewsLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1,2,3].map((i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, p: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="40%" height={14} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : farmerReviews.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#92400e', fontWeight: 600 }}>
                Reviews ({farmerReviews.length})
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {farmerReviews.map((review, index) => (
                  <Box key={review._id || index} sx={{ 
                    mb: 3, 
                    p: 2, 
                    bgcolor: '#fefbf3', 
                    borderRadius: 2,
                    border: '1px solid #fed7aa'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar 
                        src={review.reviewer?.avatar}
                        sx={{ width: 36, height: 36, bgcolor: '#e5e7eb', color: '#6b7280' }}
                      >
                        {review.reviewer?.name ? review.reviewer.name[0].toUpperCase() : 'M'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                          {review.reviewer?.name || 'Anonymous Merchant'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating 
                            value={review.rating} 
                            readOnly 
                            size="small"
                            sx={{ color: '#fbbf24' }}
                          />
                          <Typography variant="caption" color="#6b7280">
                            <CalendarIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {review.comment && (
                      <Typography variant="body2" sx={{ color: '#4b5563', mt: 1, ml: 6 }}>
                        "{review.comment}"
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <StarIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                No Reviews Yet
              </Typography>
              <Typography variant="body2" color="#9ca3af">
                This farmer hasn't received any reviews yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseReviewModal}
            variant="outlined"
            sx={{
              color: '#92400e',
              borderColor: '#fed7aa',
              '&:hover': {
                borderColor: '#92400e',
                bgcolor: '#fef3e2'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MerchantDashboard;