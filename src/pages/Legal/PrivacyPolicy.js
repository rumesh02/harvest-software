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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const dataTypes = [
    { type: 'Personal Information', description: 'Name, email, phone number, address', purpose: 'Account creation and communication' },
    { type: 'Business Information', description: 'Farm details, business registration, certifications', purpose: 'Verification and platform trust' },
    { type: 'Transaction Data', description: 'Bid history, purchase records, payment information', purpose: 'Transaction processing and analytics' },
    { type: 'Location Data', description: 'Farm location, delivery addresses', purpose: 'Logistics and transportation coordination' },
    { type: 'Usage Data', description: 'App usage patterns, preferences, device information', purpose: 'Platform improvement and user experience' }
  ];

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
            Privacy Policy
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
            Privacy Policy
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
            Farm-to-Market Platform ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our agricultural marketplace platform.
          </Typography>
          <Typography variant="body1" paragraph>
            By using our service, you consent to the collection and use of information in accordance with this policy.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Information We Collect */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            2. Information We Collect
          </Typography>
          
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            2.1 Information You Provide
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Account Information: Name, email address, phone number, password" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Profile Information: Profile photo, business details, certifications" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Product Information: Product listings, descriptions, photos, pricing" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication Data: Messages, chat logs, support inquiries" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment Information: Billing address, payment method details (processed securely)" />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            2.2 Information Automatically Collected
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Usage Data: App usage patterns, features accessed, time spent" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Device Information: IP address, browser type, operating system" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Location Data: GPS coordinates (with permission), shipping addresses" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Cookies and Tracking: Session data, preferences, analytics" />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            2.3 Data Collection Summary
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                  <TableCell><strong>Data Type</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataTypes.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {row.type}
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.purpose}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* How We Use Information */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use your information for the following purposes:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Platform Operations: Account management, user authentication, service provision" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transaction Processing: Facilitating bids, purchases, payments, and deliveries" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication: Sending notifications, updates, support responses" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Matching Services: Connecting farmers, merchants, and transporters" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Analytics: Improving platform performance and user experience" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Security: Fraud prevention, platform security, compliance monitoring" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Legal Compliance: Meeting regulatory requirements and legal obligations" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Information Sharing */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            4. Information Sharing and Disclosure
          </Typography>
          <Typography variant="body1" paragraph>
            We may share your information in the following circumstances:
          </Typography>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            4.1 With Other Users
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Product listings and farmer information visible to merchants" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Merchant contact information shared with farmers for confirmed transactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transporter details shared for delivery coordination" />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            4.2 With Service Providers
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Payment processors for transaction handling" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Cloud storage providers for data hosting" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Analytics services for platform improvement" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication services for messaging and notifications" />
            </ListItem>
          </List>

          <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
            4.3 Legal Requirements
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Government agencies when required by law" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Law enforcement for fraud prevention or investigation" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Regulatory bodies for compliance purposes" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Data Security */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            5. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to protect your personal information:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Encryption: Data transmission and storage encryption using industry standards" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Access Controls: Limited access to personal information on a need-to-know basis" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Regular Security Audits: Ongoing security assessments and improvements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Secure Infrastructure: Protected servers and secure hosting environment" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Employee Training: Staff education on data protection and privacy practices" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Your Rights */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            6. Your Privacy Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the following rights regarding your personal information:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Access: Request copies of your personal information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Correction: Request correction of inaccurate or incomplete information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Deletion: Request deletion of your personal information (subject to legal requirements)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Data Portability: Request transfer of your data to another service" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Restriction: Request limitation of processing in certain circumstances" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Objection: Object to processing based on legitimate interests" />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            To exercise these rights, please contact us at privacy@farmto-market.com.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Data Retention */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            7. Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We retain your personal information for as long as necessary to:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Provide our services and maintain your account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Comply with legal obligations and regulatory requirements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Resolve disputes and enforce our agreements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintain business records for legitimate business purposes" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Cookies */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            8. Cookies and Tracking Technologies
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar technologies to enhance your experience:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Essential Cookies: Required for platform functionality and security" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Performance Cookies: Help us understand platform usage and improve performance" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Preference Cookies: Remember your settings and customizations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Analytics Cookies: Provide insights into user behavior and platform effectiveness" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Third Party Services */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            9. Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph>
            Our platform may integrate with third-party services that have their own privacy policies:
          </Typography>
          <List sx={{ ml: 2 }}>
            <ListItem>
              <ListItemText primary="Payment processors (Stripe, PayPal, etc.)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Map and location services (Google Maps, etc.)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Analytics providers (Google Analytics, etc.)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication services (email, SMS providers)" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Contact Information */}
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            10. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </Typography>
          <Box sx={{ ml: 2, p: 2, backgroundColor: '#f0f7f0', borderRadius: 1 }}>
            <Typography variant="body1"><strong>Email:</strong> privacy@farmto-market.com</Typography>
            <Typography variant="body1"><strong>Phone:</strong> +123 456 7890</Typography>
            <Typography variant="body1"><strong>Address:</strong> Farm-to-Market Platform Privacy Team</Typography>
            <Typography variant="body1"><strong>Data Protection Officer:</strong> dpo@farmto-market.com</Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Your privacy is important to us. We are committed to protecting your personal information and ensuring transparency in our data practices.
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

export default PrivacyPolicy;
