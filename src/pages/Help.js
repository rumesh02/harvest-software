import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Click the Register button on the top right, fill in your details, and follow the instructions sent to your email."
  },
  {
    question: "How can I reset my password?",
    answer:
      "Go to the Login page and click on 'Forgot Password'. Enter your email to receive reset instructions."
  },
  {
    question: "How do I contact a farmer or merchant?",
    answer:
      "Once logged in, use the messaging feature on the dashboard to reach out directly to farmers or merchants."
  },
  {
    question: "Where can I see my orders?",
    answer:
      "Navigate to your dashboard and select 'My Orders' from the sidebar to view all your current and past orders."
  }
];

const Help = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/#contact");
    setTimeout(() => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        pt: { xs: 8, md: 10 },
        pb: 4
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              minWidth: 0,
              px: 1.2,
              py: 1,
              borderRadius: 2,
              mr: 2,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              textTransform: 'none',
              borderColor: '#4CAF50',
              color: '#4CAF50',
              '&:hover': {
                borderColor: '#388e3c',
                color: '#388e3c',
                background: '#e8f5e9'
              }
            }}
            aria-label="Back to Dashboard"
          >
            <ArrowBackIcon sx={{ fontSize: 28 }} />
          </Button>
          <HelpOutlineIcon sx={{ fontSize: 40, color: "#4CAF50", mr: 1 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#2c3e50",
              fontSize: { xs: "1.8rem", md: "2.5rem" }
            }}
          >
            Help Center
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "#7f8c8d",
            fontWeight: 400,
            fontSize: { xs: "1rem", md: "1.2rem" },
            mb: 4
          }}
        >
          Find answers to common questions or reach out for more support.
        </Typography>

        <Card sx={{ mb: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ p: isMobile ? 2 : 4 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: "#2c3e50"
              }}
            >
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, idx) => (
              <Accordion key={idx} sx={{ mb: 2, borderRadius: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-content-${idx}`}
                  id={`faq-header-${idx}`}
                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                >
                  {faq.question}
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: 3,
              p: isMobile ? 2 : 4
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#2c3e50", mb: 1 }}
              >
                Need more help?
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                If you can't find your answer here, you can contact our support team directly:
              </Typography>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                  Phone: <Box component="span" sx={{ color: '#4CAF50', fontWeight: 600 }}>+94 77 123 4567</Box>, <Box component="span" sx={{ color: '#4CAF50', fontWeight: 600 }}>+94 11 234 5678</Box>
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                  Email: <Box component="span" sx={{ color: '#4CAF50', fontWeight: 600 }}>support@farmtomarket.lk</Box>, <Box component="span" sx={{ color: '#4CAF50', fontWeight: 600 }}>info@farmtomarket.lk</Box>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Help;
