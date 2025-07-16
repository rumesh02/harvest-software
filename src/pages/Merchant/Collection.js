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
    const [farmerDetails, setFarmerDetails] = useState({});

    const fetchConfirmedBids = useCallback(async () => {
        try {
            const merchantId = user?.sub || localStorage.getItem('user_id');
            if (!merchantId) {
                setLoading(false);
                return;
            }
            
            console.log("Fetching confirmed bids for merchant:", merchantId);
            
            // First try to get data from the new collections API
            let collections = [];
            try {
                const collectionsResponse = await axios.get(`http://localhost:5000/api/collections/merchant/${merchantId}`);
                collections = collectionsResponse.data || [];
                console.log("Collections from new API:", collections);
            } catch (collectionsError) {
                console.log("Collections API error:", collectionsError);
                collections = [];
            }
            
            // Also get data from the confirmed bids API for fallback
            let confirmedBids = [];
            try {
                const confirmedResponse = await axios.get(`http://localhost:5000/api/confirmedbids/merchant/${merchantId}`);
                confirmedBids = confirmedResponse.data || [];
                console.log("Confirmed bids from legacy API:", confirmedBids);
            } catch (confirmedError) {
                console.log("Confirmed bids API error:", confirmedError);
                confirmedBids = [];
            }
            
            // Combine and transform data from both sources
            const allOrders = [];
            
            // Add collections (new format)
            collections.forEach(collection => {
                if (collection.status === "confirmed" || collection.status === "paid" || collection.status === "delivered") {
                    allOrders.push({
                        ...collection,
                        source: 'collections'
                    });
                }
            });
            
            // Add confirmed bids (legacy format) - only if not already in collections
            confirmedBids.forEach(bid => {
                // Check if this bid is already represented in collections
                const existsInCollections = allOrders.some(order => order.orderId === bid.orderId);
                if (!existsInCollections && (bid.status === "confirmed" || bid.status === "paid" || bid.status === "delivered")) {
                    allOrders.push({
                        ...bid,
                        source: 'confirmedBids',
                        // Transform legacy format to match new format
                        productName: bid.items?.[0]?.name || 'N/A',
                        bidAmount: bid.items?.[0]?.price || 0,
                        orderWeight: bid.items?.[0]?.quantity || 0,
                        finalPrice: bid.amount || 0
                    });
                }
            });
            
            // Sort by status priority
            const statusOrder = {
                "confirmed": 1,    // Awaiting Payment
                "paid": 2,         // Awaiting Pickup
                "delivered": 3     // Delivered
            };
            
            const sortedOrders = allOrders.sort((a, b) => {
                const orderA = statusOrder[a.status] || 999;
                const orderB = statusOrder[b.status] || 999;
                return orderA - orderB;
            });
            
            console.log("Final sorted orders:", sortedOrders);
            setConfirmedBids(sortedOrders);
            
            // Extract farmer details
            const farmerDetailsMap = {};
            sortedOrders.forEach(order => {
                if (order.farmerDetails) {
                    farmerDetailsMap[order.farmerId] = {
                        name: order.farmerDetails.name,
                        phone: order.farmerDetails.phone,
                        // For collections from new API, use the farmerRegisteredAddress
                        address: order.location?.farmerRegisteredAddress?.address,
                        district: order.location?.farmerRegisteredAddress?.district
                    };
                } else {
                    // For legacy confirmed bids, try to extract from other sources
                    farmerDetailsMap[order.farmerId] = {
                        name: order.farmerName || 'Unknown',
                        phone: order.farmerPhone || 'N/A',
                        address: order.farmerAddress || order.productLocation?.farmerAddress,
                        district: order.farmerDistrict || order.productLocation?.farmerDistrict
                    };
                }
            });
            
            setFarmerDetails(farmerDetailsMap);
            
        } catch (error) {
            console.error("Error fetching collections:", error);
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
        // Find the item to check its status
        const item = confirmedBids.find(b => b._id === id);
        const displayStatus = getDisplayStatus(item?.status);
        
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
            const selectedOrdersData = confirmedBids.filter(item => selected.includes(item._id));
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

    // Function to get location display with farmer fallback
    const getLocationDisplay = (item) => {
        // For collections from new API
        if (item.source === 'collections') {
            // Priority 1: Use selectedLocation address from the new collection model (farmer's chosen location during listing)
            if (item.location && item.location.selectedLocation && item.location.selectedLocation.address) {
                return item.location.selectedLocation.address;
            }
            
            // Priority 2: Use the computed display address from the new collection model
            if (item.location && item.location.displayAddress) {
                return item.location.displayAddress;
            }
            
            // Priority 3: Use farmer registered address from the new collection model
            if (item.location && item.location.farmerRegisteredAddress) {
                const { address, district } = item.location.farmerRegisteredAddress;
                if (address && district) {
                    return `${address}, ${district}`;
                } else if (address) {
                    return address;
                } else if (district) {
                    return district;
                }
            }
        }
        
        // For legacy confirmed bids
        if (item.source === 'confirmedBids') {
            // Priority 1: Use productLocation from confirmed bid (farmer's chosen location during listing)
            if (item.productLocation && item.productLocation.address) {
                return item.productLocation.address;
            }
            
            // Priority 2: Use farmer registered address from confirmed bid
            if (item.farmerRegisteredAddress) {
                const { address, district } = item.farmerRegisteredAddress;
                if (address && district) {
                    return `${address}, ${district}`;
                } else if (address) {
                    return address;
                } else if (district) {
                    return district;
                }
            }
        }
        
        // Fallback for old confirmed bid structure (backward compatibility)
        if (item.productLocation && item.productLocation.address) {
            return item.productLocation.address;
        }
        
        if (item.harvestDetails && item.harvestDetails.location) {
            return item.harvestDetails.location;
        }
        
        // Final fallback: Farmer's registered address + district from farmerDetails
        const farmer = farmerDetails[item.farmerId];
        if (farmer && farmer.address && farmer.district) {
            return `${farmer.address}, ${farmer.district}`;
        }
        
        if (farmer && farmer.address) {
            return farmer.address;
        }
        
        if (farmer && farmer.district) {
            return farmer.district;
        }
        
        // If no location data is available, return location not available
        return 'Location not available';
    };

    // Function to render conditional checkbox based on status
    const renderCheckbox = (item) => {
        const status = item.status;
        const displayStatus = getDisplayStatus(status);
        
        if (displayStatus === "Awaiting Pickup") {
            // Show enabled checkbox for Awaiting Pickup
            return (
                <Checkbox
                    checked={selected.includes(item._id)}
                    onChange={() => handleSelect(item._id)}
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
                            <TableCell>Location</TableCell>
                            {/* Add more columns as needed */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {confirmedBids.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No confirmed bids in collection</TableCell>
                            </TableRow>
                        ) : (
                            confirmedBids.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        {renderCheckbox(item)}
                                    </TableCell>
                                    <TableCell>
                                        {/* Handle both collection and confirmed bid structures */}
                                        {item.productName || item.items?.[0]?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {/* Handle both collection and confirmed bid structures */}
                                        Rs. {item.bidAmount || item.items?.[0]?.price || 0} (per Kg)
                                    </TableCell>
                                    <TableCell>
                                        {/* Handle both collection and confirmed bid structures */}
                                        {item.orderWeight || item.items?.[0]?.quantity || 0} Kg
                                    </TableCell>
                                    <TableCell>
                                        {/* Handle both collection and confirmed bid structures */}
                                        Rs. {item.finalPrice || item.amount}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getDisplayStatus(item.status)}
                                            color={statusColors[item.status] || "default"}
                                            sx={{ color: "#fff" }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {getLocationDisplay(item)}
                                        </Typography>
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
