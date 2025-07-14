import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Chip,
  FormControl,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import Pagination from '@mui/material/Pagination';

const statusStyles = {
  Done: { bgcolor: '#43a047', color: '#fff' }, // Green
  Pending: { bgcolor: '#e0e0e0', color: '#2e7d32' }, // Gray bg, green text
  Reject: { bgcolor: '#f5f5f5', color: '#b71c1c' }, // Light gray bg, dark red text
};

const paymentStyles = {
  Completed: { bgcolor: '#43a047', color: '#fff' }, // Green
  Pending: { bgcolor: '#e0e0e0', color: '#2e7d32' }, // Gray bg, green text
  Cancelled: { bgcolor: '#f5f5f5', color: '#b71c1c' }, // Light gray bg, dark red text
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const farmerId = localStorage.getItem("user_id");
        const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
        const bids = response.data;
        const transformedOrders = await Promise.all(
          bids.map(async (bid) => {
            let merchantName = "Anonymous";
            let merchantPhone = "N/A";
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
            // Ensure paymentStatus is always set
            let paymentStatus = getPaymentStatus(bid.status, bid.paymentStatus);
            if (!paymentStatus) paymentStatus = 'Pending';
            return {
              id: bid._id,
              harvest: bid.productName,
              price: `Rs. ${bid.bidAmount}`,
              weight: `${bid.orderWeight}kg`,
              buyer: merchantName,
              phone: merchantPhone,
              status: getOrderStatus(bid.status),
              paymentStatus,
            };
          })
        );
        setOrders(transformedOrders);
      } catch (error) {
        setSnackbar({ open: true, message: 'Error fetching orders', severity: 'error' });
      }
    };
    fetchBids();
    const interval = setInterval(fetchBids, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
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
      await axios.put(`http://localhost:5000/api/bids/status/${id}`, { status: bidStatus });
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      setSnackbar({ open: true, message: 'Order status updated', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update order status', severity: 'error' });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box sx={{ bgcolor: '#f5fff5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, bgcolor: '#fff' }}>
          <Typography variant="h4" fontWeight={700} color="success.dark" gutterBottom>
            Orders
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#fafafa' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                  <TableCell>No.</TableCell>
                  <TableCell>Harvest</TableCell>
                  <TableCell>Bid Price</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Mobile No.</TableCell>
                  <TableCell>Order Status</TableCell>
                  <TableCell>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((order, index) => (
                  <TableRow key={order.id} hover sx={{ bgcolor: (indexOfFirstItem + index) % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                    <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell>{order.harvest}</TableCell>
                    <TableCell>{order.price}</TableCell>
                    <TableCell>{order.weight}</TableCell>
                    <TableCell>{order.buyer}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          sx={{
                            ...statusStyles[order.status],
                            fontWeight: 600,
                            borderRadius: 1,
                            '& .MuiSelect-select': {
                              py: 1.2,
                            },
                          }}
                        >
                          <MenuItem value="Done" sx={statusStyles.Done}>Done</MenuItem>
                          <MenuItem value="Pending" sx={statusStyles.Pending}>Pending</MenuItem>
                          <MenuItem value="Reject" sx={statusStyles.Reject}>Reject</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status === "Reject" ? "Cancelled" : order.paymentStatus}
                        sx={{
                          ...paymentStyles[order.status === "Reject" ? "Cancelled" : order.paymentStatus],
                          fontWeight: 600,
                          px: 1.5,
                          fontSize: 15,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => setCurrentPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default OrderPage;
