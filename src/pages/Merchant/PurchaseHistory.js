import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReviewDialog from "../../components/ReviewDialog";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const PurchaseHistory = () => {
  const { user } = useAuth0();
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch delivered orders from the Collection API
  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const merchantId = user?.sub || localStorage.getItem('user_id');
        if (!merchantId) {
          setLoading(false);
          return;
        }

        // Fetch from collections API
        const response = await axios.get(`http://localhost:5000/api/collections/merchant/${merchantId}`);
        const collections = response.data || [];
        
        // Filter only delivered orders
        const delivered = collections.filter(order => order.status === 'Delivered');
        setDeliveredOrders(delivered);
        
      } catch (error) {
        console.error("Error fetching delivered orders:", error);
        setError("Failed to load purchase history");
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub || localStorage.getItem('user_id')) {
      fetchDeliveredOrders();
    }
  }, [user]);

  const handleRateClick = (order) => {
    setSelectedOrder(order);
    setSelectedFarmer(order.farmerDetails?.name || order.farmerName || "Unknown Farmer");
    setReviewOpen(true);
  };

  const handleReviewSubmit = (review) => {
    alert(
      `Review submitted for ${selectedFarmer}!\nRating: ${review.rating}\nComment: ${review.comment}`
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: "20px" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Purchase History
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🛒 Delivered Orders
      </Typography>

      {deliveredOrders.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No delivered orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Orders that have been delivered will appear here
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {deliveredOrders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card sx={{ maxWidth: 350, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={order.items?.[0]?.image || order.productImage || "/Images/placeholder.jpg"}
                  alt={order.items?.[0]?.name || order.productName || "Product"}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {order.items?.[0]?.name || order.productName || "Product"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Farmer:</strong> {order.farmerDetails?.name || order.farmerName || "Unknown"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Date:</strong> {new Date(order.createdAt || order.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Quantity:</strong> {order.orderWeight || order.items?.[0]?.quantity || "N/A"} kg
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Final Price:</strong> Rs. {order.finalPrice || order.price || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Status:</strong> 
                    <Box component="span" sx={{ 
                      ml: 1, 
                      px: 1, 
                      py: 0.25, 
                      borderRadius: 1, 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {order.status}
                    </Box>
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2, mt: 'auto' }}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => handleRateClick(order)}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1
                    }}
                  >
                    Rate Farmer
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        farmer={selectedFarmer}
        onSubmit={handleReviewSubmit}
      />
    </Box>
  );
};

export default PurchaseHistory;
