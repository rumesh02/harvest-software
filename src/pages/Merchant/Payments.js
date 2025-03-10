import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import AppleIcon from "@mui/icons-material/Apple";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";

const Payments = () => {
  const amount = 12000.0; // Directly setting the amount value

  const [cardNumber, setCardNumber] = useState(""); // Only keep state for the card number

  const handlePayment = () => {
    alert(`Payment of Rs.${amount} processed successfully!`);
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>Pay Now</Typography>

      <Box sx={{ marginBottom: "20px" }}>
        <Typography variant="body1">Farm-to-Market</Typography>
        <Typography variant="h4" fontWeight="bold">Rs.{amount.toFixed(2)}</Typography>
        <Typography variant="body2" color="textSecondary">Order №070490</Typography>
      </Box>

      <TextField
        fullWidth
        label="Card number"
        variant="outlined"
        type="text"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        sx={{ marginBottom: "20px" }}
      />

      <Typography variant="body2" color="textSecondary" gutterBottom>Other payment methods</Typography>

      <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <Button variant="contained" startIcon={<AppleIcon />} sx={{ background: "black", color: "white" }}>
          Apple Pay
        </Button>
        <Button variant="contained" sx={{ background: "#6772E5", color: "white" }}>
          Stripe
        </Button>
        <Button variant="contained" sx={{ background: "#0070BA", color: "white" }}>
          PayPal
        </Button>
        <Button variant="contained" sx={{ background: "orange", color: "white" }}>
          Bitcoin
        </Button>
        <Button variant="contained" startIcon={<CreditCardIcon />} sx={{ background: "#EB001B", color: "white" }}>
          MasterCard
        </Button>
        <Button variant="contained" startIcon={<CreditCardIcon />} sx={{ background: "#1A1F71", color: "white" }}>
          Visa Card
        </Button>
      </Box>

      <Button
        variant="contained"
        startIcon={<PaymentIcon />}
        fullWidth
        sx={{ background: amount ? "#FFA500" : "#E0E0E0", color: "white" }}
        onClick={handlePayment}
        disabled={!amount}
      >
        Pay Rs.{amount.toFixed(2)}
      </Button>
    </Box>
  );
};

export default Payments;
