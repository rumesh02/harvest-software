
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleIcon from "@mui/icons-material/People";


const About = () => {
  const navigate = useNavigate();

  // Role-based dashboard redirect
  const handleBack = () => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "farmer") navigate("/");
    else if (userRole === "merchant") navigate("/merchant/dashboard");
    else if (userRole === "transporter") navigate("/transporter/dashboard");
    else if (userRole === "admin") navigate("/admin/dashboard");
    else navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "linear-gradient(135deg, #f7f7f7 60%, #e0eafc 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", pt: 10 }}>
      <Paper elevation={8} sx={{ maxWidth: 700, width: "100%", p: { xs: 3, sm: 6 }, borderRadius: 5, mt: 4, boxShadow: 12, background: "rgba(255,255,255,0.95)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, justifyContent: "center" }}>
          <EmojiNatureIcon sx={{ color: "#43a047", fontSize: 48 }} />
          <Typography variant="h2" fontWeight={900} color="#e09f3e" sx={{ letterSpacing: 1 }}>
            About Us
          </Typography>
        </Box>
        <Divider sx={{ mb: 4, borderColor: "#e09f3e" }} />
        <Typography variant="h5" color="#222" sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}>
          Empowering the Farm-to-Market Journey
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "#444", fontSize: "1.15rem", textAlign: "center" }}>
          Our platform bridges <b>farmers</b>, <b>merchants</b>, and <b>transporters</b> for a seamless, transparent, and efficient agricultural marketplace. We champion local producers, simplify logistics, and ensure the freshest harvest reaches every buyer.
        </Typography>
        <Box sx={{ display: "flex", gap: 4, justifyContent: "center", my: 4, flexWrap: "wrap" }}>
          <Box sx={{ textAlign: "center", p: 2, minWidth: 120, borderRadius: 3, bgcolor: "#e8f5e9", boxShadow: 2 }}>
            <PeopleIcon sx={{ color: "#388e3c", fontSize: 44 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, color: "#388e3c" }}>Farmers</Typography>
            <Typography variant="caption" color="text.secondary">Growers & Producers</Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 2, minWidth: 120, borderRadius: 3, bgcolor: "#fffde7", boxShadow: 2 }}>
            <ShoppingCartIcon sx={{ color: "#e09f3e", fontSize: 44 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, color: "#e09f3e" }}>Merchants</Typography>
            <Typography variant="caption" color="text.secondary">Buyers & Retailers</Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 2, minWidth: 120, borderRadius: 3, bgcolor: "#e3f2fd", boxShadow: 2 }}>
            <LocalShippingIcon sx={{ color: "#1976d2", fontSize: 44 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, color: "#1976d2" }}>Transporters</Typography>
            <Typography variant="caption" color="text.secondary">Logistics Partners</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="#555" sx={{ mb: 4, textAlign: "center", fontSize: "1.05rem" }}>
          We foster trust, efficiency, and growth for everyone in the supply chain. Whether you are a grower, a buyer, or a logistics partner, we are here to support your journey with technology and care.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBack}
            sx={{
              mt: 2,
              borderRadius: 3,
              fontWeight: 700,
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              boxShadow: 4,
              background: "linear-gradient(90deg, #43a047 0%, #e09f3e 100%)",
              color: "#fff",
              '&:hover': {
                background: "linear-gradient(90deg, #388e3c 0%, #e09f3e 100%)",
                color: "#fff"
              }
            }}
            startIcon={<EmojiNatureIcon />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default About;
