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