import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Terms of Service
          </Typography>
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={() => navigate('/home')}
          >
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header Section */}
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            Terms of Service
          </Typography>
          
          <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: '#666' }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {/* Introduction */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Farm-to-Market Platform ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website and services that connect farmers, merchants, and transporters in an agricultural marketplace ecosystem.
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* User Accounts */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            2. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            To access certain features of our service, you must register for an account. You are responsible for:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Providing accurate and complete information during registration" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintaining the security of your account credentials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="All activities that occur under your account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Notifying us immediately of any unauthorized use" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Platform Services */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            3. Platform Services
          </Typography>
          <Typography variant="body1" paragraph>
            Farm-to-Market provides a digital marketplace platform that facilitates:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Product listing and discovery for agricultural products" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Bidding and negotiation systems between farmers and merchants" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transportation coordination through our transporter network" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication tools and messaging systems" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment processing and transaction management" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* User Responsibilities */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            4. User Responsibilities
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            4.1 Farmers
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Provide accurate product descriptions, quantities, and quality information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Ensure products meet food safety and quality standards" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Honor confirmed bids and delivery commitments" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintain proper licensing and certifications as required by law" />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            4.2 Merchants
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Make bids in good faith with intent to purchase" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Complete payments according to agreed terms" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide accurate delivery and pickup information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Respect quality standards and inspection processes" />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            4.3 Transporters
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Maintain valid transportation licenses and insurance" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide reliable and timely transportation services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Handle products with appropriate care and storage conditions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate effectively regarding delivery status and any issues" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Prohibited Activities */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            5. Prohibited Activities
          </Typography>
          <Typography variant="body1" paragraph>
            You agree not to engage in any of the following prohibited activities:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Listing illegal, contaminated, or unsafe products" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Making false or misleading product claims" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Engaging in fraudulent bidding or payment practices" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Circumventing our platform to conduct direct transactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Harassing, threatening, or abusing other users" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attempting to hack, disrupt, or damage our systems" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Violating any applicable laws or regulations" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Payment Terms */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            6. Payment Terms
          </Typography>
          <Typography variant="body1" paragraph>
            All transactions conducted through our platform are subject to the following payment terms:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Payments must be made through our approved payment methods" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Platform fees may apply to transactions and will be clearly disclosed" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment disputes should be reported within 48 hours of delivery" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Refunds and cancellations are subject to our refund policy" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Limitation of Liability */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            7. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            Farm-to-Market serves as an intermediary platform. We are not responsible for:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Product quality, safety, or compliance with regulations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Delivery delays or transportation issues" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Disputes between users regarding transactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Loss or damage to products during transit" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Actions or omissions of individual users" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Privacy */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            8. Privacy and Data Protection
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by reference, explains how we collect, use, and protect your information when you use our service.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Termination */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            9. Account Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to terminate or suspend your account immediately, without prior notice, for any violation of these Terms or for any other reason we deem necessary to protect our platform and users.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Changes to Terms */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            10. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or platform notification. Continued use of our service after such changes constitutes acceptance of the new Terms.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Contact Information */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            11. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at:
          </Typography>
          <Box sx={{ ml: 2, p: 2, backgroundColor: '#f0f7f0', borderRadius: 1 }}>
            <Typography variant="body1"><strong>Email:</strong> legal@farmto-market.com</Typography>
            <Typography variant="body1"><strong>Phone:</strong> +123 456 7890</Typography>
            <Typography variant="body1"><strong>Address:</strong> Farm-to-Market Platform Legal Department</Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              By using Farm-to-Market Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/home')}
              sx={{ 
                backgroundColor: '#2e7d32',
                '&:hover': { backgroundColor: '#1b5e20' }
              }}
            >
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfService;
