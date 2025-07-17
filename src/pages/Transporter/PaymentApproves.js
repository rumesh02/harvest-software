import React, { useState, useEffect } from "react";
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
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as TruckIcon
} from "@mui/icons-material";

const PaymentApproves = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData = [
        {
          id: 1,
          merchantName: "Green Valley Merchants",
          farmerName: "Saman Perera",
          productName: "Tomatoes",
          quantity: "100kg",
          amount: "Rs. 15,000",
          requestDate: "2025-01-15",
          status: "pending",
          deliveryAddress: "Colombo 03",
          vehicleType: "Small Truck"
        },
        {
          id: 2,
          merchantName: "Fresh Market Co.",
          farmerName: "Nimal Silva",
          productName: "Carrots",
          quantity: "50kg",
          amount: "Rs. 8,500",
          requestDate: "2025-01-14",
          status: "pending",
          deliveryAddress: "Kandy",
          vehicleType: "Van"
        },
        {
          id: 3,
          merchantName: "City Wholesale",
          farmerName: "Ajith Bandara",
          productName: "Potatoes",
          quantity: "200kg",
          amount: "Rs. 25,000",
          requestDate: "2025-01-13",
          status: "approved",
          deliveryAddress: "Galle",
          vehicleType: "Large Truck"
        }
      ];
      setPaymentRequests(mockData);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    // Update the request status
    setPaymentRequests(prev => 
      prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: actionType, remarks }
          : req
      )
    );
    
    // Close dialog and reset
    setDialogOpen(false);
    setSelectedRequest(null);
    setRemarks('');
    setActionType('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <MoneyIcon sx={{ mr: 2, fontSize: 30, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Payment Approval Requests
          </Typography>
        </Box>

        {paymentRequests.length === 0 ? (
          <Alert severity="info">
            No payment approval requests found.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Merchant</strong></TableCell>
                  <TableCell><strong>Farmer</strong></TableCell>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell><strong>Quantity</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Delivery</strong></TableCell>
                  <TableCell><strong>Vehicle Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.merchantName}</TableCell>
                    <TableCell>{request.farmerName}</TableCell>
                    <TableCell>{request.productName}</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>{request.amount}</TableCell>
                    <TableCell>{request.deliveryAddress}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <TruckIcon sx={{ mr: 1, fontSize: 16 }} />
                        {request.vehicleType}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status.toUpperCase()} 
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleAction(request, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={() => handleAction(request, 'rejected')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approved' ? 'Approve Payment Request' : 'Reject Payment Request'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="body1" mb={2}>
                Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} the payment request for:
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                <strong>Merchant:</strong> {selectedRequest.merchantName}<br />
                <strong>Amount:</strong> {selectedRequest.amount}<br />
                <strong>Product:</strong> {selectedRequest.productName} ({selectedRequest.quantity})
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks (Optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any remarks or comments..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmAction}
            variant="contained"
            color={actionType === 'approved' ? 'success' : 'error'}
          >
            {actionType === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentApproves;
