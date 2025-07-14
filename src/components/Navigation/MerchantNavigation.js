import React from "react";
import { MenuItem, ListItemIcon, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// Define the handleMenuClose function
const handleMenuClose = () => {
  // Add your menu close logic here, e.g., setAnchorEl(null);
};

// Add a new menu item for pending payments
<MenuItem 
  component={Link} 
  to="/merchant/payments"
  onClick={handleMenuClose}
>
  <ListItemIcon>
    <AccessTimeIcon fontSize="small" />
  </ListItemIcon>
  <Typography>Pending Payments</Typography>
</MenuItem>