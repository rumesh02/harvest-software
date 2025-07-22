import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
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
  Rating
} from '@mui/material';
import { 
  TrendingUp as RevenueIcon, 
  ShoppingCart as OrdersIcon, 
  AccountBalance as YearlyIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  Reviews as ReviewsIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyData: [],
    totalOrders: 27,
    topBuyers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth0();
  const [reviews, setReviews] = useState([]);
  const [farmerRating, setFarmerRating] = useState(0);

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

    const fetchReviewsData = async () => {
      try {
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/farmer/${user.sub}`);
        console.log('Reviews API response:', reviewsResponse.data);
        
        // The API returns { reviews: [...] }, so extract the reviews array
        const reviewsData = reviewsResponse.data.reviews || [];
        
        // Sort reviews by latest first (createdAt descending)
        const sortedReviews = reviewsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setReviews(sortedReviews);
        console.log('Reviews fetched and sorted successfully:', sortedReviews);

        // We can use the farmerRating from the user data instead of separate avgRating
      } catch (error) {
        console.error("Error fetching reviews data:", error);
        // Set reviews to empty array on error to prevent slice error
        setReviews([]);
      }
    };
    if (user?.sub) {
      fetchRevenueData();
      fetchReviewsData();
    }
  }, [user]);

  useEffect(() => {
    if (user?.sub) {
      axios.get(`http://localhost:5000/api/users/${user.sub}`)
        .then(res => {
          console.log('User data received:', res.data);
          setFarmerRating(res.data.farmerRating || 0);
        }) // Fetch farmerRating
        .catch(err => console.error("Error fetching farmer ratings:", err));
    }
  }, [user]);

  // Format the monthly data to ensure it has proper names and values
  const formattedMonthlyData = (revenueData.monthlyData || []).map(item => ({
    name: item.name || item.month || '',
    revenue: typeof item.revenue === 'number' ? item.revenue : 0,
  }));

  const { monthlyRevenue, yearlyRevenue, totalOrders, topBuyers, monthlyData } = revenueData;

  // Check if we have any data to display
  const hasData = totalOrders > 0 || monthlyRevenue > 0 || yearlyRevenue > 0 || (monthlyData && monthlyData.length > 0);

  // Enhanced stat card data with navigation bar colors
  const statCards = [
    {
      title: "Monthly Revenue",
      value: `Rs. ${monthlyRevenue.toLocaleString()}`,
      icon: <RevenueIcon fontSize="small" />,
      bgColor: "#d4edda",
      color: "#155724"
    },
    {
      title: "Yearly Revenue",
      value: `Rs. ${yearlyRevenue.toLocaleString()}`,
      icon: <YearlyIcon fontSize="small" />,
      bgColor: "#d4edda",
      color: "#155724"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <OrdersIcon fontSize="small" />,
      bgColor: "#d4edda",
      color: "#155724"
    },

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
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#155724', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>
            Revenue: Rs. {payload[0].value?.toLocaleString() || 0}
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
          <CircularProgress size={60} sx={{ color: '#10B981', mb: 2 }} />
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
                // Retry fetch
                if (user?.sub) {
                  axios.get(`http://localhost:5000/api/revenue/farmer/${user.sub}`)
                    .then(response => {
                      setRevenueData(response.data);
                      setError(null);
                    })
                    .catch(error => {
                      setError(error.response?.data?.message || "Failed to load revenue data");
                    })
                    .finally(() => setLoading(false));
                }
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
              color: '#155724',
              mb: 0.5,
              fontSize: { xs: 22, md: 24 }
            }}
          >
            Farmer Dashboard
          </Typography>
          <Typography variant="body2" color="#155724" sx={{ fontWeight: 400, fontSize: { xs: 15, md: 16 } }}>
            Track your harvest sales and revenue growth
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
                  boxShadow: '0 1.5px 6px rgba(67, 160, 71, 0.07)',
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(67, 160, 71, 0.13)"
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                    <Typography 
                        variant="subtitle2" 
                        color="#155724" 
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
                        background: '#d4edda',
                        color: '#155724',
                        width: 44,
                        height: 44,
                        boxShadow: '0 1.5px 6px rgba(67, 160, 71, 0.10)',
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
              background: 'linear-gradient(135deg, #10B981 0%, #155724 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MoneyIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography variant="h5" color="#000" gutterBottom sx={{ fontWeight: 600 }}>
              No Revenue Data Available Yet
            </Typography>
            <Typography variant="body1" color="#000" sx={{ maxWidth: 400, mx: 'auto' }}>
              Start listing your harvests to see your revenue analytics and track your business growth
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
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
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#155724', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                    Monthly Revenue Analytics
                  </Typography>
                  <Typography variant="body2" color="#155724" sx={{ fontSize: { xs: 12, md: 13 } }}>
                    Track your harvest sales revenue over time
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: '#43a047',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(67, 160, 71, 0.12)'
                  }}
                >
                  <RevenueIcon fontSize="small" />
                </Avatar>
              </Box>
              <Box sx={{ height: 240, mt: 1.5 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedMonthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2f1" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#155724', fontSize: 11, fontWeight: 500 }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: '#388e3c', fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#155724', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(value) => `Rs. ${value.toLocaleString()}`}
                      label={{ value: 'Revenue (Rs.)', angle: -90, position: 'insideLeft', fill: '#388e3c', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="revenue" 
                      fill="#43a047"
                      radius={[5, 5, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {/* Chart legend */}
                <Box sx={{ mt: 0.5, textAlign: 'right' }}>
                  <Typography variant="caption" color="#388e3c" sx={{ fontSize: 11 }}>● Revenue</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
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
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#155724', mb: 0.5, fontSize: { xs: 15, md: 17 } }}>
                    Top Buyers
                  </Typography>
                  <Typography variant="body2" color="#155724" sx={{ fontSize: { xs: 12, md: 13 } }}>
                    Your most valuable customers
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    background: '#43a047',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(67, 160, 71, 0.12)'
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </Box>
              {topBuyers && topBuyers.length > 0 ? (
                <Box sx={{ height: 240, mt: 1.5, overflowY: 'auto' }}>
                  <List sx={{ width: '100%', p: 0 }}>
                    {topBuyers.map((buyer, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" sx={{ my: 1 }} />}
                        <ListItem 
                          sx={{ 
                            px: 2, 
                            py: 2, 
                            borderRadius: 2, 
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              bgcolor: '#c8e6c9',
                              transform: 'translateX(4px)'
                            } 
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              src={buyer.avatar || undefined}
                              alt={buyer.name}
                              sx={{ 
                                width: 38, 
                                height: 38, 
                                bgcolor: !buyer.avatar ? '#a5d6a7' : undefined,
                                color: '#155724',
                                fontWeight: 700,
                                fontSize: 18,
                                border: '2px solid #c8e6c9',
                                boxShadow: '0 1.5px 6px rgba(67, 160, 71, 0.07)'
                              }}
                            >
                              {!buyer.avatar && buyer.name ? buyer.name[0].toUpperCase() : null}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#155724', fontSize: { xs: 15, md: 16 } }}>
                                {buyer.name}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="caption" color="#388e3c" sx={{ mt: 0.5, display: 'block' }}>
                                  {buyer.location || "Location not available"}
                                </Typography>
                                <Typography variant="caption" color="#155724" sx={{ display: 'block', fontWeight: 500 }}>
                                  Orders: {buyer.orders || 0}
                                </Typography>
                              </>
                            }
                          />
                          <Chip
                            label={`Rs. ${buyer.totalSpent?.toLocaleString() || "0"}`}
                            sx={{
                              background: '#d4edda',
                              color: '#155724',
                              fontWeight: 600,
                              fontSize: 13,
                              boxShadow: '0 1.5px 6px rgba(67, 160, 71, 0.07)'
                            }}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box sx={{ 
                  height: 240,
                  mt: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: '#f8fffe',
                  borderRadius: 2,
                  border: '1px dashed #d4edda'
                }}>
                  <PersonIcon sx={{ fontSize: 48, color: '#155724', mb: 2, opacity: 0.6 }} />
                  <Typography color="#155724" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                    No top buyers found yet
                  </Typography>
                  <Typography variant="body2" color="#388e3c" sx={{ maxWidth: 200 }}>
                    Start selling your harvests to build customer relationships
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Reviews Section */}
        <Grid container spacing={{ xs: 2.5, md: 4 }} sx={{ mt: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#155724', mb: 3, fontSize: { xs: 15, md: 17 } }}>
                <ReviewsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Your Rating
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Rating value={farmerRating} precision={0.1} readOnly size="large" />
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                  {farmerRating ? `${farmerRating.toFixed(1)} / 5` : "No ratings yet"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on customer reviews
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                height: '100%',
                background: 'rgba(255,255,255,0.9)',
                border: "1px solid #E5E7EB",
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                maxHeight: '400px', 
                overflow: 'auto'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#155724', mb: 3, fontSize: { xs: 15, md: 17 } }}>
                <ReviewsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Reviews
              </Typography>
              {(reviews || []).length === 0 ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                  color: 'text.secondary'
                }}>
                  <ReviewsIcon sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="body1">
                    No reviews yet
                  </Typography>
                  <Typography variant="body2">
                    Reviews will appear here once customers rate your products
                  </Typography>
                </Box>
              ) : (
                <List>
                  {(reviews || []).slice(0, 5).map((review, idx) => (
                    <Box key={idx}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#4CAF50' }}>
                            {review.reviewer?.name ? review.reviewer.name.charAt(0).toUpperCase() : 'M'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Chip
                                  label={`${review.rating}/5`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#2e7d32' }}>
                                {review.reviewer?.name || 'Anonymous Merchant'}
                              </Typography>
                              {review.comment && (
                                <Typography variant="body2" sx={{ mb: 1, fontStyle: review.comment ? 'normal' : 'italic', color: review.comment ? 'text.primary' : 'text.secondary' }}>
                                  "{review.comment}"
                                </Typography>
                              )}
                              {!review.comment && (
                                <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                                  No comment provided
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < Math.min((reviews || []).length, 5) - 1 && <Divider />}
                    </Box>
                  ))}
                  {(reviews || []).length > 5 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Showing 5 of {(reviews || []).length} reviews
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
export default Dashboard;