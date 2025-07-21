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
} from "@mui/material";
import {
  ShoppingBasket as ShoppingBasketIcon,
  LocalOffer as LocalOfferIcon,
  AttachMoney as AttachMoneyIcon,
  Reviews as ReviewsIcon,
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";

const FarmerDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [listedItems, setListedItems] = useState([]);
  const [farmerRating, setFarmerRating] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      const farmerId = user?.sub;

      // Fetch listed items
      const listedItemsResponse = await axios.get(`/api/harvest/farmer/${farmerId}`);
      setListedItems(listedItemsResponse.data);

      // Fetch rating
      const ratingResponse = await axios.get(`/api/ratings/farmer/${farmerId}`);
      setFarmerRating(ratingResponse.data.averageRating || 0);

      // Fetch total sales
      const salesResponse = await axios.get(`/api/sales/farmer/${farmerId}`);
      setTotalSales(salesResponse.data.totalSales || 0);

      // Fetch reviews
      const reviewsResponse = await axios.get(`/api/reviews/farmer/${farmerId}`);
      const reviewsData = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
      const sortedReviews = reviewsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(sortedReviews);
    } catch (err) {
      setError("Error loading dashboard data.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const statCards = [
    {
      title: "Listed Items",
      value: listedItems.length,
      icon: <LocalOfferIcon fontSize="small" />,
      bgColor: "#d1ecf1",
      color: "#0c5460",
    },
    {
      title: "Total Sales",
      value: totalSales,
      icon: <AttachMoneyIcon fontSize="small" />,
      bgColor: "#f8d7da",
      color: "#721c24",
    },
    {
      title: "Average Rating",
      value: farmerRating ? farmerRating.toFixed(1) : "No rating yet",
      icon: <StarIcon fontSize="small" />,
      bgColor: "#fff3cd",
      color: "#856404",
    },
    {
      title: "Customer Reviews",
      value: (reviews || []).length,
      icon: <ReviewsIcon fontSize="small" />,
      bgColor: "#d4edda",
      color: "#155724",
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Farmer Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ backgroundColor: card.bgColor, color: card.color }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ backgroundColor: card.color, mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {card.title}
                    </Typography>
                    <Typography variant="h6">{card.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Listed Items
              </Typography>
              {listedItems.length === 0 ? (
                <Typography>No items listed.</Typography>
              ) : (
                <List>
                  {listedItems.slice(0, 5).map((item) => (
                    <React.Fragment key={item._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <ShoppingBasketIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={`Quantity: ${item.quantity} | Price: Rs.${item.price}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, maxHeight: '400px', overflow: 'auto' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Reviews
              </Typography>
              {reviews.length === 0 ? (
                <Typography>No reviews available.</Typography>
              ) : (
                <List>
                  {reviews.slice(0, 5).map((review) => (
                    <React.Fragment key={review._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>{review.reviewerName?.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${review.reviewerName} - ${review.rating} ★`}
                          secondary={review.comment}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FarmerDashboard;
