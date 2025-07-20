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
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchCompletedPayments } from "../../services/orderService";
import { format } from 'date-fns';
import ReviewDialog from "../../components/ReviewDialog"; // Make sure this path is correct

const PurchaseHistory = () => {
  const { user } = useAuth0();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadCompletedPayments = async () => {
      if (!user?.sub) return;

      try {
        setLoading(true);
        const completedPayments = await fetchCompletedPayments(user.sub);
        setPurchases(completedPayments);
      } catch (error) {
        console.error("Error loading completed payments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedPayments();
  }, [user]);

  const handleRateClick = (order) => {
    setSelectedOrder(order);
    setSelectedFarmer(order.farmerName || "Unknown Farmer");
    setReviewOpen(true);
  };

  const handleReviewClose = (success) => {
    if (success) {
      alert(`Review submitted successfully for ${selectedFarmer}!`);
    }
    setReviewOpen(false);
    setSelectedOrder(null);
    setSelectedFarmer("");
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (purchases.length === 0) {
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography variant="h5" gutterBottom>Purchase History</Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">
            You don't have any completed purchases yet.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>Purchase History</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>🛒 Recent Purchases</Typography>

      <Grid container spacing={3}>
        {purchases.map((purchase) => (
          <Grid item xs={12} sm={6} md={4} key={purchase._id}>
            <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={purchase.items[0]?.imageUrl || "https://via.placeholder.com/200?text=Farm+Product"}
                alt={purchase.items[0]?.name || "Farm Product"}
              />
              <CardContent>
                <Typography variant="h6">{purchase.items[0]?.name || "Farm Product"}</Typography>
                <Typography variant="body1">
                  <strong>Purchased on:</strong> {format(new Date(purchase.createdAt), 'yyyy-MM-dd')}
                </Typography>
                <Typography variant="body1">
                  <strong>Order ID:</strong> {purchase.orderId}
                </Typography>
                <Typography variant="body1">
                  <strong>Farmer:</strong> {purchase.farmerName || "Unknown Farmer"}
                </Typography>
                <Typography variant="body1">
                  <strong>Price:</strong> Rs. {purchase.amount.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  <strong>Quantity:</strong> {purchase.items[0]?.quantity || 0} kg
                </Typography>
                <Typography variant="body1">
                  <strong>Payment Method:</strong> {purchase.paymentMethod || "Online Payment"}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {purchase.status === "paid" ? "Completed" : purchase.status}
                </Typography>
              </CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                <Button variant="contained" color="warning">View Invoice</Button>
                <Button variant="contained" color="success" onClick={() => handleRateClick(purchase)}>
                  Rate Farmer
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewOpen}
        onClose={handleReviewClose}
        farmerId={selectedOrder?.farmerId}
        merchantId={user?.sub}
        orderId={selectedOrder?._id}
        farmerRatings={{}}
        product={selectedOrder?.items?.[0]}
      />
    </Box>
  );
};

export default PurchaseHistory;
