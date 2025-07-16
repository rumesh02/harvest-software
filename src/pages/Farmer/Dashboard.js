import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as OrderIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Reviews as ReviewsIcon
} from "@mui/icons-material";
import Rating from "@mui/material/Rating";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    monthlyData: [],
    totalOrders: 27 // You might want to fetch this separately
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [farmerRating, setFarmerRating] = useState(0);
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

    const fetchReviewsData = async () => {
      try {
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/farmer/${user.sub}`);
        setReviews(reviewsResponse.data);

        const avgRatingResponse = await axios.get(`http://localhost:5000/api/reviews/farmer/${user.sub}/average`);
        setAvgRating(avgRatingResponse.data.avgRating || 0);
      } catch (error) {
        console.error("Error fetching reviews data:", error);
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
        .then(res => setFarmerRating(res.data.farmerRatings || 0)) // Fetch farmerRatings
        .catch(err => console.error("Error fetching farmer ratings:", err));
    }
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600, 
            color: '#2E7D32',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AssessmentIcon fontSize="large" />
          Farmer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your farm's performance and earnings
        </Typography>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <MoneyIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Revenue This Month
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                    Rs. {revenueData.monthlyRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#FF9800', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <TrendingUpIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Revenue This Year
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                    Rs. {revenueData.yearlyRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: '#2196F3', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <OrderIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                    {revenueData.totalOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts and Lists */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={7}>
              <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Monthly Revenue Trends
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Top Buyers
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '70%',
                  color: 'text.secondary'
                }}>
                  <PersonIcon sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="body1">
                    No buyer data available
                  </Typography>
                  <Typography variant="body2">
                    Start selling to see your top buyers
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Reviews Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  <StarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
            
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, maxHeight: '400px', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  <ReviewsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Reviews
                </Typography>
                {reviews.length === 0 ? (
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
                    {reviews.map((review, idx) => (
                      <Box key={idx}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#4CAF50' }}>
                              <StarIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Chip 
                                  label={`${review.rating}/5`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {review.comment}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {idx < reviews.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};
export default Dashboard;