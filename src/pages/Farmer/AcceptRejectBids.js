import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  MonetizationOn as MoneyIcon,
  Scale as ScaleIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";

const AcceptRejectBids = () => {
  const [pendingBids, setPendingBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingBids();
  }, []);

  const fetchPendingBids = async () => {
    try {
      setLoading(true);
      const farmerId = localStorage.getItem("user_id"); // Get logged-in farmer's ID
      const response = await axios.get(`http://localhost:5000/api/bids?farmerId=${farmerId}`);
      const pending = response.data.filter(bid => bid.status === "Pending");
      setPendingBids(pending);
    } catch (error) {
      console.error("Error fetching pending bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidAction = async (bidId, action) => {
    try {
      setActionLoading(bidId);
      console.log(`Attempting to ${action} bid with ID:`, bidId);
      
      if (!bidId) {
        throw new Error("Bid ID is missing");
      }

      const endpoint = `http://localhost:5000/api/bids/${action.toLowerCase()}/${bidId}`;
      console.log("Calling endpoint:", endpoint);

      const response = await axios.put(endpoint);
      console.log("Server response:", response.data);

      if (response.data) {
        alert(`Bid ${action.toLowerCase()}ed successfully!`);
        await fetchPendingBids(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing bid:`, error);
      let errorMessage = `Failed to ${action.toLowerCase()} bid. `;
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
            <CheckCircleIcon fontSize="large" />
            Accept / Reject Bids
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and manage incoming bids from merchants for your harvests
          </Typography>
        </Box>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Empty State */}
            {pendingBids.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <InventoryIcon sx={{ fontSize: 80, color: '#6c757d', mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="text.secondary">
                    No Pending Bids
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You don't have any pending bids at the moment. Check back later!
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary */}
                <Alert 
                  severity="info" 
                  sx={{ mb: 3 }}
                  icon={<InventoryIcon />}
                >
                  You have <strong>{pendingBids.length}</strong> pending bid{pendingBids.length !== 1 ? 's' : ''} to review
                </Alert>

                {/* Bids Table */}
                <TableContainer component={Paper} elevation={2}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>No.</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InventoryIcon fontSize="small" />
                            Harvest
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MoneyIcon fontSize="small" />
                            Bid Price
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScaleIcon fontSize="small" />
                            Weight
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            Buyer
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" />
                            Mobile No.
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingBids.map((bid, index) => (
                        <TableRow 
                          key={bid._id} 
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                            '&:hover': { bgcolor: '#f0f0f0' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {bid.productName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`Rs. ${bid.bidAmount}`}
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {bid.orderWeight} kg
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {bid.merchantName || "Anonymous"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {bid.merchantPhone || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleBidAction(bid._id, "Accept")}
                                disabled={actionLoading === bid._id}
                                sx={{
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  '&:hover': {
                                    bgcolor: '#2e7d32'
                                  }
                                }}
                              >
                                {actionLoading === bid._id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  'Accept'
                                )}
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => handleBidAction(bid._id, "Reject")}
                                disabled={actionLoading === bid._id}
                                sx={{
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  '&:hover': {
                                    bgcolor: '#d32f2f'
                                  }
                                }}
                              >
                                {actionLoading === bid._id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  'Reject'
                                )}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AcceptRejectBids;
