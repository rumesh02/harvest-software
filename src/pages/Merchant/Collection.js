import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        const fetchConfirmedBids = async () => {
            try {
                const merchantId = user?.sub || localStorage.getItem('user_id');
                if (!merchantId) {
                    setLoading(false);
                    return;
                }
                // Fetch all bids
                const response = await axios.get("http://localhost:5000/api/bids");
                const allBids = response.data;
                // Filter for this merchant and confirmed status
                const confirmed = allBids.filter(
                    bid =>
                        bid.merchantId === merchantId &&
                        (bid.status === "Confirmed" || bid.status === "Paid")
                );
                setConfirmedBids(confirmed);
            } catch (error) {
                console.error("Error fetching confirmed bids:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.sub || localStorage.getItem('user_id')) {
            fetchConfirmedBids();
        }
    }, [user]);

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
        if (status === "Confirmed") return "Awaiting Payment";
        if (status === "Paid") return "Awaiting Pickup";
        if (status === "Delivered") return "Delivered";
        if (status === "Pending") return "Pending";
        if (status === "Cancelled") return "Cancelled";
        return status;
    };

    const statusColors = {
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
                                    <TableCell>{bid.productName}</TableCell>
                                    <TableCell>Rs. {bid.bidAmount} (per Kg)</TableCell>
                                    <TableCell>{bid.orderWeight} Kg</TableCell>
                                    <TableCell>Rs. {bid.bidAmount * bid.orderWeight}</TableCell>
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
