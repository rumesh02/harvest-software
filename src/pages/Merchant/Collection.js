//this file is part of the Merchant Collection page
import React, { useEffect, useState, useCallback, lazy, Suspense } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Checkbox, Box, Typography, Dialog, DialogTitle, 
    DialogContent, DialogActions, DialogContentText
} from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const FindVehicles = lazy(() => import("../../components/FindVehicles"));

const Collection = () => {
    const { user } = useAuth0();
    const [confirmedBids, setConfirmedBids] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transportDialogOpen, setTransportDialogOpen] = useState(false);
    const [findVehiclesOpen, setFindVehiclesOpen] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);

    const fetchConfirmedBids = useCallback(async () => {
        try {
            const merchantId = user?.sub || localStorage.getItem('user_id');
            if (!merchantId) {
                setLoading(false);
                return;
            }
            // Fetch confirmed bids from the confirmedBids collection
            const response = await axios.get(`http://localhost:5000/api/confirmedbids/merchant/${merchantId}`);
            const allConfirmedBids = response.data;
            
            // Filter for confirmed bids that are either 'confirmed', 'paid', or 'delivered'
            const confirmed = allConfirmedBids.filter(
                bid => bid.status === "confirmed" || bid.status === "paid" || bid.status === "delivered"
            );
            
            // Sort by status priority: Awaiting Payment -> Awaiting Pickup -> Delivered
            const statusOrder = {
                "confirmed": 1,    // Awaiting Payment
                "Confirmed": 1,    // Legacy support
                "paid": 2,         // Awaiting Pickup
                "Paid": 2,         // Legacy support
                "delivered": 3,    // Delivered
                "Delivered": 3     // Legacy support
            };
            
            const sortedConfirmed = confirmed.sort((a, b) => {
                const orderA = statusOrder[a.status] || 999;
                const orderB = statusOrder[b.status] || 999;
                return orderA - orderB;
            });
            
            setConfirmedBids(sortedConfirmed);
        } catch (error) {
            console.error("Error fetching confirmed bids:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.sub || localStorage.getItem('user_id')) {
            fetchConfirmedBids();
        }
    }, [user, fetchConfirmedBids]);

    // Add listener for payment completion events to refresh the collection
    useEffect(() => {
        const handlePaymentCompleted = () => {
            console.log("Payment completed, refreshing collection...");
            fetchConfirmedBids();
        };
        
        // Listen for payment completion events
        window.addEventListener('paymentCompleted', handlePaymentCompleted);
        window.addEventListener('refreshCollection', handlePaymentCompleted);
        
        return () => {
            window.removeEventListener('paymentCompleted', handlePaymentCompleted);
            window.removeEventListener('refreshCollection', handlePaymentCompleted);
        };
    }, [fetchConfirmedBids]);

    const handleSelect = (id) => {
        // Find the bid to check its status
        const bid = confirmedBids.find(b => b._id === id);
        const displayStatus = getDisplayStatus(bid?.status);
        
        // Only allow selection for "Awaiting Pickup" status
        if (displayStatus === "Awaiting Pickup") {
            setSelected((prev) =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        }
    };

    const handleCollectNow = () => {
        // Open transport preference dialog
        setTransportDialogOpen(true);
    };

    const handleTransportChoice = (useAppTransport) => {
        // Close the dialog
        setTransportDialogOpen(false);
        
        if (useAppTransport) {
            // User wants to use app's transport facility
            // Get the selected orders data
            const selectedOrdersData = confirmedBids.filter(bid => selected.includes(bid._id));
            setSelectedOrders(selectedOrdersData);
            
            // Open the FindVehicles dialog
            setFindVehiclesOpen(true);
        } else {
            // User will use personal transport
            alert(`Perfect! You've selected ${selected.length} order(s) for personal collection. Please coordinate with the farmers for pickup details.`);
            // Here you can update the order status or perform other actions
            // You might want to mark these orders as "Ready for Personal Collection"
        }
        
        // Optionally clear selections after processing
        // setSelected([]);
    };

    const getDisplayStatus = (status) => {
        if (!status) return "Unknown";
        if (status === "confirmed") return "Awaiting Payment";
        if (status === "paid") return "Awaiting Pickup";
        if (status === "delivered") return "Delivered";
        if (status === "pending") return "Pending";
        if (status === "canceled") return "Cancelled";
        // Handle legacy statuses for backward compatibility
        if (status === "Confirmed") return "Awaiting Payment";
        if (status === "Paid") return "Awaiting Pickup";
        if (status === "Delivered") return "Delivered";
        if (status === "Pending") return "Pending";
        if (status === "Cancelled") return "Cancelled";
        return status;
    };

    // Function to render conditional checkbox based on status
    const renderCheckbox = (bid) => {
        const status = bid.status;
        const displayStatus = getDisplayStatus(status);
        
        if (displayStatus === "Awaiting Pickup") {
            // Show enabled checkbox for Awaiting Pickup
            return (
                <Checkbox
                    checked={selected.includes(bid._id)}
                    onChange={() => handleSelect(bid._id)}
                />
            );
        } else if (displayStatus === "Awaiting Payment") {
            // Show disabled light grey checkbox for Awaiting Payment
            return (
                <Checkbox
                    disabled
                    sx={{ 
                        color: '#e0e0e0',
                        '&.Mui-disabled': {
                            color: '#e0e0e0'
                        }
                    }}
                />
            );
        } else {
            // No checkbox for other statuses
            return null;
        }
    };

    const statusColors = {
        confirmed: "warning",      // Awaiting Payment (yellow/orange)
        paid: "primary",           // Awaiting Pickup (blue)
        delivered: "success",      // Delivered (green)
        pending: "info",           // Pending (light blue)
        canceled: "error",         // Cancelled (red)
        // Legacy status support
        Confirmed: "warning",      // Awaiting Payment (yellow/orange)
        Paid: "primary",           // Awaiting Pickup (blue)
        Delivered: "success",      // Delivered (green)
        Pending: "info",           // Pending (light blue)
        Cancelled: "error",        // Cancelled (red)
    };

    if (loading) {
        return <Typography>Loading confirmed bids...</Typography>;
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Collection</h2>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={selected.length === 0}
                    onClick={handleCollectNow}
                    sx={{ float: "right", mb: 2 }}
                >
                    Collect Now
                </Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Product</TableCell>
                            <TableCell>Bid Amount</TableCell>
                            <TableCell>Order Weight</TableCell>
                            <TableCell>Final Price</TableCell>
                            <TableCell>Status</TableCell>
                            {/* Add more columns as needed */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {confirmedBids.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No confirmed bids in collection</TableCell>
                            </TableRow>
                        ) : (
                            confirmedBids.map((bid) => (
                                <TableRow key={bid._id}>
                                    <TableCell>
                                        {renderCheckbox(bid)}
                                    </TableCell>
                                    <TableCell>{bid.items?.[0]?.name || 'N/A'}</TableCell>
                                    <TableCell>Rs. {bid.items?.[0]?.price || 0} (per Kg)</TableCell>
                                    <TableCell>{bid.items?.[0]?.quantity || 0} Kg</TableCell>
                                    <TableCell>Rs. {bid.amount}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getDisplayStatus(bid.status)}
                                            color={statusColors[bid.status] || "default"}
                                            sx={{ color: "#fff" }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Transport Preference Dialog */}
            <Dialog
                open={transportDialogOpen}
                onClose={() => setTransportDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#2E7D32', fontSize: '20px' }}>
                        🚚 Choose Your Transport Option
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3, fontSize: '18px', lineHeight: 1.6 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: '18px' }}>
                            You've selected <strong>{selected.length}</strong> order(s) for collection. 
                            How would you like to collect your orders?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '16px' }}>
                            💡 <strong>Choose the option that works best for you:</strong>
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
                    <Button
                        onClick={() => handleTransportChoice(true)}
                        variant="contained"
                        fullWidth
                        sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': { bgcolor: '#45a049' },
                            py: 1.5,
                            fontSize: '18px',
                            textTransform: 'none'
                        }}
                    >
                         Use App Transport Service

                    </Button>
                    <Button
                        onClick={() => handleTransportChoice(false)}
                        variant="outlined"
                        fullWidth
                        sx={{
                            borderColor: '#2196F3',
                            color: '#2196F3',
                            '&:hover': { borderColor: '#1976D2', bgcolor: '#f5f5f5' },
                            py: 1.5,
                            fontSize: '18px',
                            textTransform: 'none'
                        }}
                    >
                         Use My Own Transport

                    </Button>
                    <Button
                        onClick={() => setTransportDialogOpen(false)}
                        sx={{
                            color: '#757575',
                            textTransform: 'none',
                            mt: 1,
                            fontSize: '16px'
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Find Vehicles Dialog */}
            <Suspense fallback={<div>Loading vehicle options...</div>}>
                <Dialog
                    open={findVehiclesOpen}
                    onClose={() => setFindVehiclesOpen(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>Find Transport Vehicles</DialogTitle>
                    <DialogContent dividers>
                        <FindVehicles selectedOrders={selectedOrders} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setFindVehiclesOpen(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Suspense>
        </Paper>
    );
};

export default Collection;
