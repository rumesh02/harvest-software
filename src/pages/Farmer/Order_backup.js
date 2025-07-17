import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Chip,
  Avatar,
  FormControl,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from "@mui/material";
import {
  ShoppingCart as OrderIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Scale as WeightIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bids and convert them to orders
  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        setError(null);
        const farmerId = localStorage.getItem("user_id"); // Get logged-in farmer's ID
        const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
        const bids = response.data;

        // Fetch merchant details for each bid
        const transformedOrders = await Promise.all(
          bids.map(async (bid) => {
            let merchantName = "Anonymous";
            let merchantPhone = "N/A";

            // Fetch merchant details from the backend
            if (bid.merchantId) {
              try {
                const merchantResponse = await axios.get(`http://localhost:5000/api/users/${bid.merchantId}`);
                const merchant = merchantResponse.data;
                merchantName = merchant.name || "Anonymous";
                merchantPhone = merchant.phone || "N/A";
              } catch (error) {
                console.error(`Error fetching merchant details for ID ${bid.merchantId}:`, error);
              }
            }

            // Transform bid to order format
            return {
              id: bid._id,
              harvest: bid.productName,
              price: `Rs. ${bid.bidAmount}`,
              weight: `${bid.orderWeight}kg`,
              buyer: merchantName, // Use fetched merchant name
              phone: merchantPhone, // Use fetched merchant phone
              status: getOrderStatus(bid.status),
              paymentStatus: getPaymentStatus(bid.status, bid.paymentStatus),
            };
          })
        );

        setOrders(transformedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchBids();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchBids, 30000);
    return () => clearInterval(interval);
  }, []);

  // Convert bid status to order status
  const getOrderStatus = (bidStatus) => {
    switch (bidStatus) {
      case "Accepted":
        return "Pending";
      case "Rejected":
        return "Reject";
      case "Completed":
        return "Done";
      default:
        return bidStatus;
    }
  };

  // Add new function to determine payment status
  const getPaymentStatus = (bidStatus, currentPaymentStatus) => {
    switch (bidStatus) {
      case "Rejected":
        return "Cancelled";
      case "Completed":
        return "Completed";
      case "Accepted":
        return "Pending";
      default:
        return currentPaymentStatus;
    }
  };

  // Handle order status changes
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Convert order status back to bid status
      let bidStatus;
      switch (newStatus) {
        case "Done":
          bidStatus = "Completed";
          break;
        case "Reject":
          bidStatus = "Rejected";
          break;
        case "Pending":
          bidStatus = "Accepted";
          break;
        default:
          bidStatus = newStatus;
      }

      // Update bid status in backend
      await axios.put(`http://localhost:5000/api/bids/status/${id}`, {
        status: bidStatus,
      });

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        <OrderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Orders
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Pending Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    {orders.filter(o => o.status === 'Pending').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                  <ScheduleIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8', borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Completed Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {orders.filter(o => o.status === 'Done').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ffebee', borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Rejected Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {orders.filter(o => o.status === 'Reject').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                  <CancelIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {orders.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                  <OrderIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Orders Table */
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Harvest</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Bid Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Mobile No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Order Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#2e7d32', mr: 2, width: 32, height: 32 }}>
                          <InventoryIcon />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {order.harvest}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MoneyIcon sx={{ color: '#2e7d32', mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          {order.price}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WeightIcon sx={{ color: '#666', mr: 1 }} />
                        <Typography variant="body2">
                          {order.weight}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ color: '#666', mr: 1 }} />
                        <Typography variant="body2">
                          {order.buyer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ color: '#666', mr: 1 }} />
                        <Typography variant="body2">
                          {order.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          sx={{
                            bgcolor: order.status === "Done" ? "#e8f5e8" : 
                                   order.status === "Pending" ? "#fff3e0" : 
                                   order.status === "Reject" ? "#ffebee" : "#f5f5f5",
                            '& .MuiSelect-select': {
                              fontWeight: 'medium'
                            }
                          }}
                        >
                          <MenuItem value="Done">Done</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Reject">Reject</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status === "Reject" ? "Cancelled" : order.paymentStatus}
                        color={
                          order.status === "Reject" ? "error" :
                          order.paymentStatus === "Completed" ? "success" :
                          order.paymentStatus === "Pending" ? "warning" : "default"
                        }
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default OrderPage;
