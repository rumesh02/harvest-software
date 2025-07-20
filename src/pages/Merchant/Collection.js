//this file is part of the Merchant Collection page
import React, { useEffect, useState, useCallback, lazy, Suspense } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Checkbox, Box, Typography, Dialog, DialogTitle, 
    DialogContent, DialogActions, DialogContentText, IconButton, Alert
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import LocationDisplay from "../../components/LocationDisplay";

const FindVehicles = lazy(() => import("../../components/FindVehicles"));

const Collection = () => {
    const { user } = useAuth0();
    const [confirmedBids, setConfirmedBids] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limitAlert, setLimitAlert] = useState(false);
    const [transportDialogOpen, setTransportDialogOpen] = useState(false);
    const [findVehiclesOpen, setFindVehiclesOpen] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [farmerDetails, setFarmerDetails] = useState({});
    const [transporterDetailsOpen, setTransporterDetailsOpen] = useState(false);
    const [transporterDetails, setTransporterDetails] = useState([]);
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [orderPreferences, setOrderPreferences] = useState([]);

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
            const isCurrentlySelected = selected.includes(id);
            
            // If trying to add a new item and already at limit
            if (!isCurrentlySelected && selected.length >= 5) {
                setLimitAlert(true);
                // Hide alert after 3 seconds
                setTimeout(() => setLimitAlert(false), 3000);
                return;
            }
            
            setSelected((prev) =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        }
    };

    const handleCollectNow = () => {
        // Initialize order preferences with selected orders
        const selectedOrdersData = confirmedBids.filter(item => selected.includes(item._id));
        const initialPreferences = selectedOrdersData.map((order, index) => ({
            orderId: order._id,
            orderData: order,
            preference: index + 1 // Default order 1, 2, 3...
        }));
        setOrderPreferences(initialPreferences);
        
        // Open transport preference dialog
        setTransportDialogOpen(true);
    };

    const handleOrderPreferenceChange = (orderId, newPreference) => {
        setOrderPreferences(prevPreferences => {
            // First, remove the preference from any other order that might have it
            const updatedPreferences = prevPreferences.map(pref => 
                pref.preference === newPreference && pref.orderId !== orderId 
                    ? { ...pref, preference: null }
                    : pref
            );
            
            // Then set the new preference for the target order
            return updatedPreferences.map(pref => 
                pref.orderId === orderId 
                    ? { ...pref, preference: newPreference }
                    : pref
            );
        });
    };

    const handleTransportChoice = async (useAppTransport) => {
        // Validate order preferences if multiple orders are selected
        if (orderPreferences.length > 1) {
            const incompletePreferences = orderPreferences.filter(pref => !pref.preference);
            if (incompletePreferences.length > 0) {
                alert('Please arrange the collection order for all selected items before proceeding.');
                return;
            }
            
            // Check for duplicate preferences
            const preferences = orderPreferences.map(pref => pref.preference);
            const uniquePreferences = [...new Set(preferences)];
            if (preferences.length !== uniquePreferences.length) {
                alert('Please ensure each order has a unique collection sequence number.');
                return;
            }
        }

        // Close the dialog
        setTransportDialogOpen(false);
        
        if (useAppTransport) {
            // User wants to use app's transport facility
            // Get the selected orders data, sorted by preference
            let selectedOrdersData = confirmedBids.filter(item => selected.includes(item._id));
            
            // Sort by preference if preferences exist
            if (orderPreferences.length > 0) {
                selectedOrdersData = selectedOrdersData.sort((a, b) => {
                    const prefA = orderPreferences.find(pref => pref.orderId === a._id)?.preference || 999;
                    const prefB = orderPreferences.find(pref => pref.orderId === b._id)?.preference || 999;
                    return prefA - prefB;
                });
            }
            
            setSelectedOrders(selectedOrdersData);
            
            // Open the FindVehicles dialog
            setFindVehiclesOpen(true);
        } else {
            // User will use personal transport - show transporter details
            let selectedOrdersData = confirmedBids.filter(item => selected.includes(item._id));
            
            // Sort by preference if preferences exist
            if (orderPreferences.length > 0) {
                selectedOrdersData = selectedOrdersData.sort((a, b) => {
                    const prefA = orderPreferences.find(pref => pref.orderId === a._id)?.preference || 999;
                    const prefB = orderPreferences.find(pref => pref.orderId === b._id)?.preference || 999;
                    return prefA - prefB;
                });
            }
            
            // Fetch transporter details for each selected order
            const transporterDetailsData = [];
            
            for (const order of selectedOrdersData) {
                try {
                    // Fetch farmer details (transporter in this case)
                    const farmerResponse = await axios.get(`http://localhost:5000/api/users/${order.farmerId}`);
                    const farmerData = farmerResponse.data;
                    
                    // Fetch product details to get location
                    let productLocation = null;
                    if (order.productLocation) {
                        productLocation = order.productLocation;
                    } else if (order.items && order.items.length > 0) {
                        try {
                            const productResponse = await axios.get(`http://localhost:5000/api/products/${order.items[0].productId}`);
                            productLocation = productResponse.data.location;
                        } catch (productError) {
                            console.error("Error fetching product location:", productError);
                        }
                    }
                    
                    transporterDetailsData.push({
                        ...order,
                        farmerName: farmerData.name,
                        farmerPhone: farmerData.phone,
                        farmerLocation: productLocation || farmerData.location || { address: "Location not available" },
                        capacity: order.items?.[0]?.quantity || "N/A",
                        pricePerKm: "###", // Default since this is for own transport
                    });
                    
                    // Debug logging
                    console.log('Transporter Details Data:', {
                        farmerName: farmerData.name,
                        farmerPhone: farmerData.phone,
                        farmerLocation: productLocation || farmerData.location || { address: "Location not available" },
                        productLocation: productLocation,
                        farmerDataLocation: farmerData.location
                    });
                } catch (error) {
                    console.error("Error fetching transporter details:", error);
                    transporterDetailsData.push({
                        ...order,
                        farmerName: "Name not available",
                        farmerPhone: "Contact not available",
                        farmerLocation: { address: "Location not available" },
                        capacity: "N/A",
                        pricePerKm: "###",
                    });
                }
            }
            
            setTransporterDetails(transporterDetailsData);
            setTransporterDetailsOpen(true);
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

    // Function to get selected items for invoice
    const getSelectedItemsForInvoice = () => {
        return confirmedBids.filter(item => selected.includes(item._id));
    };

    // Function to calculate invoice totals
    const calculateInvoiceTotals = () => {
        const selectedItems = getSelectedItemsForInvoice();
        let totalQuantity = 0;
        let totalCost = 0;

        selectedItems.forEach(item => {
            const quantity = item.orderWeight || item.items?.[0]?.quantity || 0;
            const finalPrice = item.finalPrice || item.amount || 0;
            
            totalQuantity += quantity;
            totalCost += finalPrice;
        });

        return {
            totalQuantity,
            totalCost: totalCost.toFixed(2)
        };
    };

    // Function to print invoice
    const handlePrintInvoice = () => {
        window.print();
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
            {/* Warning message about order limit */}
            <Alert 
                severity="warning" 
                sx={{ 
                    mb: 3, 
                    backgroundColor: '#fff3cd',
                    borderColor: '#ffc107',
                    '& .MuiAlert-icon': {
                        color: '#ff9800'
                    }
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                     Important: You can select maximum 5 orders at a time for collection to prevent damage to your items during transport.
                </Typography>
            </Alert>

            {/* Alert for when limit is exceeded */}
            {limitAlert && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setLimitAlert(false)}
                >
                    Can't select more than 5 orders at a time!
                </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Collection</h2>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        disabled={selected.length === 0}
                        onClick={() => setInvoiceDialogOpen(true)}
                        sx={{ mb: 2 }}
                    >
                         See Invoice
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={selected.length === 0}
                        onClick={handleCollectNow}
                        sx={{ mb: 2 }}
                    >
                        Collect Now
                    </Button>
                </Box>
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
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '95vh',
                        overflow: 'hidden',
                        background: "#f0f9ff"
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    pb: 2,
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <IconButton
                        onClick={() => setTransportDialogOpen(false)}
                        sx={{
                            mr: 2,
                            color: 'white',
                            borderRadius: 2,
                            padding: '8px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                        🚚 Choose Your Transport Option
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <DialogContentText sx={{ mb: 3, fontSize: '18px', lineHeight: 1.6 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: '18px', color: '#1e40af' }}>
                            You've selected <strong>{selected.length}</strong> order(s) for collection. 
                            How would you like to collect your orders?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontSize: '16px' }}>
                            💡 <strong>Choose the option that works best for you:</strong>
                        </Typography>
                    </DialogContentText>

                    {/* Order Arrangement Section */}
                    {orderPreferences.length > 1 && (
                        <Box sx={{ 
                            mb: 4, 
                            p: 3, 
                            backgroundColor: '#f8fafc', 
                            borderRadius: 2, 
                            border: '1px solid #e2e8f0' 
                        }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1e40af', fontWeight: 600 }}>
                                📋 Arrange Your Collection Order
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                                Please arrange the orders in the sequence you would like to collect them (1st, 2nd, 3rd...):
                            </Typography>
                            
                            {orderPreferences.map((orderPref) => (
                                <Box key={orderPref.orderId} sx={{ 
                                    mb: 2, 
                                    p: 2, 
                                    backgroundColor: 'white', 
                                    borderRadius: 1, 
                                    border: '1px solid #d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
                                            {orderPref.orderData?.productName || orderPref.orderData?.items?.[0]?.name || 'Product'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                            Quantity: {orderPref.orderData?.orderWeight || orderPref.orderData?.items?.[0]?.quantity || 'N/A'} kg
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: '#374151', mr: 1 }}>
                                            Collection Order:
                                        </Typography>
                                        {[1, 2, 3, 4, 5].slice(0, orderPreferences.length).map(num => (
                                            <Box key={num} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    checked={orderPref.preference === num}
                                                    onChange={() => handleOrderPreferenceChange(orderPref.orderId, num)}
                                                    sx={{
                                                        color: '#2563eb',
                                                        '&.Mui-checked': {
                                                            color: '#2563eb',
                                                        },
                                                        p: 0.5
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ ml: 0.5, color: '#374151' }}>
                                                    {num}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}

                            {/* Summary of current arrangement */}
                            <Box sx={{ 
                                mt: 3, 
                                p: 2, 
                                backgroundColor: '#e0f2fe', 
                                borderRadius: 1, 
                                border: '1px solid #0284c7' 
                            }}>
                                <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 600, mb: 1 }}>
                                    📌 Current Collection Sequence:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#0369a1' }}>
                                    {orderPreferences
                                        .filter(pref => pref.preference)
                                        .sort((a, b) => a.preference - b.preference)
                                        .map((pref, index) => {
                                            const productName = pref.orderData?.productName || pref.orderData?.items?.[0]?.name || 'Product';
                                            return `${pref.preference}. ${productName}`;
                                        })
                                        .join(' → ') || 'Please select collection order for each item'
                                    }
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
                    <Button
                        onClick={() => handleTransportChoice(true)}
                        variant="contained"
                        fullWidth
                        sx={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            '&:hover': { 
                                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                            },
                            py: 1.5,
                            fontSize: '18px',
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 600
                        }}
                    >
                         Use App Transport Service

                    </Button>
                    <Button
                        onClick={() => handleTransportChoice(false)}
                        variant="outlined"
                        fullWidth
                        sx={{
                            borderColor: '#2563eb',
                            color: '#2563eb',
                            '&:hover': { 
                                borderColor: '#1d4ed8', 
                                backgroundColor: '#f0f9ff'
                            },
                            py: 1.5,
                            fontSize: '18px',
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 600
                        }}
                    >
                         Use My Own Transport

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
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            maxHeight: '95vh',
                            overflow: 'hidden',
                            background: "#f0f9ff"
                        }
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>
                        <FindVehicles 
                            selectedOrders={selectedOrders} 
                            onBack={() => setFindVehiclesOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </Suspense>

            {/* Transporter Details Dialog */}
            <Dialog
                open={transporterDetailsOpen}
                onClose={() => setTransporterDetailsOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '95vh',
                        overflow: 'hidden',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: "center", 
                    fontWeight: 700, 
                    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    color: "white",
                    fontSize: "1.5rem",
                    py: 3,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6, #1d4ed8)',
                    }
                }}>
                    <IconButton
                        onClick={() => {
                            setTransporterDetailsOpen(false);
                            setTransportDialogOpen(true);
                        }}
                        sx={{
                            position: 'absolute',
                            left: 16,
                            color: 'white',
                            borderRadius: 2,
                            padding: '8px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    🚚 Transporter Details ({transporterDetails.length} {transporterDetails.length === 1 ? 'Order' : 'Orders'})
                </DialogTitle>
                <DialogContent sx={{ p: 0, maxHeight: '80vh', overflowY: 'auto' }}>
                    <Box sx={{ 
                        p: 4, 
                        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        minHeight: "600px"
                    }}>
                        {/* Order Arrangement Section - Only show if multiple orders */}
                        {transporterDetails.length > 1 && (
                            <Box sx={{ 
                                background: 'white', 
                                borderRadius: 2, 
                                p: 4, 
                                mb: 4, 
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    mb: 3 
                                }}>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                                        📍 Pickup Locations (As per your arranged sequence)
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setTransporterDetailsOpen(false);
                                            setTransportDialogOpen(true);
                                        }}
                                        sx={{
                                            fontSize: '0.75rem',
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.5,
                                            borderColor: '#1976d2',
                                            color: '#1976d2',
                                            '&:hover': {
                                                borderColor: '#1565c0',
                                                backgroundColor: '#e3f2fd',
                                            },
                                        }}
                                    >
                                        Change Pickup Orders
                                    </Button>
                                </Box>
                                <Box sx={{ 
                                    p: 2, 
                                    backgroundColor: '#e3f2fd', 
                                    borderRadius: 1, 
                                    border: '1px solid #1976d2',
                                    mb: 2
                                }}>
                                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                                        ℹ️ Collection Sequence:
                                    </Typography>
                                    {transporterDetails.map((detail, index) => {
                                        const productName = detail?.items?.[0]?.name || 'Product';
                                        const location = detail?.farmerLocation?.address || "Location not available";
                                        const farmerPhone = detail?.farmerPhone || "Contact not available";
                                        return (
                                            <Box key={detail._id || index} sx={{ 
                                                mb: 1, 
                                                p: 1.5, 
                                                backgroundColor: 'white', 
                                                borderRadius: 1, 
                                                border: '1px solid #bbdefb' 
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0' }}>
                                                    {index + 1}. {productName} - {detail.farmerName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#424242', fontSize: '0.85rem' }}>
                                                    📍 {location}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mt: 0.5 }}>
                                                    📞 {farmerPhone}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mt: 1 }}>
                                        💡 If you need to change the collection order, click "Change Pickup Orders" above.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Summary Section */}
                        <Box sx={{ 
                            background: 'white', 
                            borderRadius: 2, 
                            p: 4, 
                            mb: 4, 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                                📊 Collection Summary
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                        {transporterDetails.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Orders
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                                    <Typography variant="h4" sx={{ color: '#16a34a', fontWeight: 700 }}>
                                        {transporterDetails.reduce((total, detail) => total + (parseFloat(detail.capacity) || 0), 0).toFixed(1)}kg
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Weight
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                                    <Typography variant="h4" sx={{ color: '#7c3aed', fontWeight: 700 }}>
                                        {new Set(transporterDetails.map(detail => detail.farmerId)).size}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Unique Farmers
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {transporterDetails.map((detail, index) => (
                            <Box key={index} sx={{ mb: 4 }}>
                                {/* Order Information */}
                                <Box sx={{ 
                                    background: 'white', 
                                    borderRadius: 2, 
                                    p: 4, 
                                    mb: 3, 
                                    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.1)',
                                    border: '1px solid #dbeafe'
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, color: '#2563eb', fontWeight: 600 }}>
                                        📋 Order #{index + 1} - {detail.items?.[0]?.name || 'Product'}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Farmer Name:</Typography>
                                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                                                {detail.farmerName}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Contact Number:</Typography>
                                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                                                {detail.farmerPhone}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Capacity:</Typography>
                                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                                                {detail.capacity} kg
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Price per KM:</Typography>
                                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                                                {detail.pricePerKm}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Location Information */}
                                <Box sx={{ 
                                    background: 'white', 
                                    borderRadius: 2, 
                                    p: 4, 
                                    mb: 3, 
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
                                        📍 Farmer's Location
                                    </Typography>
                                    
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        <strong>Address:</strong> {detail.farmerLocation?.address || "Location not available"}
                                    </Typography>
                                    
                                    {/* Location Display */}
                                    <Box sx={{ mt: 3 }}>
                                        <LocationDisplay 
                                            location={detail.farmerLocation?.coordinates || detail.farmerLocation}
                                            address={detail.farmerLocation?.address || "Location not available"}
                                            markerTitle={`${detail.farmerName}'s Location`}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button 
                        onClick={() => setTransporterDetailsOpen(false)}
                        variant="contained" 
                        sx={{ 
                            borderRadius: 3, 
                            px: 6, 
                            py: 2,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '18px',
                            minWidth: '150px',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invoice Dialog */}
            <Dialog
                open={invoiceDialogOpen}
                onClose={() => setInvoiceDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '95vh',
                        overflow: 'hidden',
                    }
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ 
                        background: 'white',
                        minHeight: '600px'
                    }}>
                        {/* Invoice Header */}
                        <Box sx={{ 
                            background: 'linear-gradient(135deg, #fff9c4 0%, #fef3cd 100%)',
                            border: '2px solid #facc15',
                            borderRadius: '8px 8px 0 0',
                            p: 3,
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#92400e',
                                fontSize: '2rem',
                                letterSpacing: 1
                            }}>
                                🌾 FARMER TO MARKET PLATFORM 🌾
                            </Typography>
                            <Typography variant="h6" sx={{ 
                                color: '#92400e',
                                mt: 1,
                                fontSize: '1.2rem'
                            }}>
                                Purchase Invoice
                            </Typography>
                            <IconButton
                                onClick={() => setInvoiceDialogOpen(false)}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: 16,
                                    color: '#92400e',
                                    backgroundColor: 'rgba(146, 64, 14, 0.1)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 64, 14, 0.2)',
                                    },
                                }}
                            >
                                <ArrowBack />
                            </IconButton>
                        </Box>

                        {/* Invoice Content */}
                        <Box sx={{ p: 4 }}>
                            {/* Invoice Details */}
                            <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                <Box>
                                    <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                                        <strong>Invoice Date:</strong> {new Date().toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                                        <strong>Invoice ID:</strong> INV-{Date.now()}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                                        <strong>Merchant:</strong> {user?.name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1, color: '#374151' }}>
                                        <strong>Total Items:</strong> {selected.length}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Invoice Table */}
                            <TableContainer component={Paper} sx={{ 
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                borderRadius: 2,
                                border: '1px solid #e5e7eb'
                            }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Item Name</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>Quantity (Kg)</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>Unit Price (Rs.)</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>Total Cost (Rs.)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getSelectedItemsForInvoice().map((item, index) => {
                                            const itemName = item.productName || item.items?.[0]?.name || 'N/A';
                                            const quantity = item.orderWeight || item.items?.[0]?.quantity || 0;
                                            const unitPrice = item.bidAmount || item.items?.[0]?.price || 0;
                                            const totalCost = item.finalPrice || item.amount || 0;

                                            return (
                                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                                                    <TableCell sx={{ fontWeight: 500 }}>{itemName}</TableCell>
                                                    <TableCell align="center">{quantity}</TableCell>
                                                    <TableCell align="center">{unitPrice.toFixed(2)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                        {totalCost.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        
                                        {/* Totals Row */}
                                        <TableRow sx={{ 
                                            backgroundColor: '#f3f4f6',
                                            borderTop: '2px solid #d1d5db'
                                        }}>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                TOTAL
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                {calculateInvoiceTotals().totalQuantity} Kg
                                            </TableCell>
                                            <TableCell align="center">-</TableCell>
                                            <TableCell align="right" sx={{ 
                                                fontWeight: 700, 
                                                fontSize: '1.2rem',
                                                color: '#059669'
                                            }}>
                                                Rs. {calculateInvoiceTotals().totalCost}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Invoice Footer */}
                            <Box sx={{ 
                                mt: 4,
                                p: 2,
                                background: 'linear-gradient(135deg, #fff9c4 0%, #fef3cd 100%)',
                                border: '2px solid #facc15',
                                borderRadius: 2,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                                    Thank you for choosing Farmer to Market Platform!
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#92400e', mt: 1 }}>
                                    Supporting local farmers, delivering fresh produce to your table.
                                </Typography>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ 
                                mt: 4, 
                                display: 'flex', 
                                gap: 2, 
                                justifyContent: 'center' 
                            }}>
                                <Button
                                    variant="outlined"
                                    onClick={handlePrintInvoice}
                                    sx={{
                                        borderColor: '#92400e',
                                        color: '#92400e',
                                        '&:hover': {
                                            borderColor: '#78350f',
                                            backgroundColor: '#fef3cd'
                                        }
                                    }}
                                >
                                    🖨️ Print Invoice
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => setInvoiceDialogOpen(false)}
                                    sx={{
                                        backgroundColor: '#92400e',
                                        '&:hover': {
                                            backgroundColor: '#78350f'
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default Collection;
