//this file is part of the Merchant Collection page
import React, { useEffect, useState, useCallback } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Checkbox, Box, Typography
} from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const Collection = () => {
    const { user } = useAuth0();
    const [confirmedBids, setConfirmedBids] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setConfirmedBids(confirmed);
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
        setSelected((prev) =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCollectNow = () => {
        // Do something with selected confirmed bids
        alert("Collecting: " + selected.join(", "));
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
                                        <Checkbox
                                            checked={selected.includes(bid._id)}
                                            onChange={() => handleSelect(bid._id)}
                                        />
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
        </Paper>
    );
};

export default Collection;
