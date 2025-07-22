import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Grid,
  Container,
  Paper,
  Alert,
  Snackbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  Send, 
  LocationOn, 
  Phone, 
  Email, 
  AccessTime,
  ArrowBack,
  WhatsApp,
  Facebook,
  Twitter,
  Instagram,
  Home as HomeIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSnackbarMessage('Message sent successfully! We\'ll get back to you soon.');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSnackbarMessage('Failed to send message. Please try again.');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToHomeContact = () => {
    navigate('/#contact');
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const contactInfo = [
    {
      icon: <LocationOn sx={{ color: '#4CAF50' }} />,
      title: 'Address',
      details: ['No. 123, Galle Road', 'Colombo 03, Sri Lanka', 'Western Province']
    },
    {
      icon: <Phone sx={{ color: '#4CAF50' }} />,
      title: 'Phone',
      details: ['+94 77 123 4567', '+94 11 234 5678']
    },
    {
      icon: <Email sx={{ color: '#4CAF50' }} />,
      title: 'Email',
      details: ['support@farmtomarket.lk', 'info@farmtomarket.lk']
    },
    {
      icon: <AccessTime sx={{ color: '#4CAF50' }} />,
      title: 'Business Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat: 9:00 AM - 4:00 PM', 'Sun: Closed']
    }
  ];

  const socialLinks = [
    { icon: <WhatsApp />, label: 'WhatsApp', color: '#25D366' },
    { icon: <Facebook />, label: 'Facebook', color: '#1877F2' },
    { icon: <Twitter />, label: 'Twitter', color: '#1DA1F2' },
    { icon: <Instagram />, label: 'Instagram', color: '#E4405F' }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pt: { xs: 8, md: 10 },
      pb: 4
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={() => navigate('/')}
              sx={{ 
                mr: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#2c3e50',
                fontSize: { xs: '1.8rem', md: '2.5rem' }
              }}
            >
              Contact Us
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#7f8c8d',
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}
          >
            We'd love to hear from you. Get in touch with our team.
          </Typography>
        </Box>

       
        <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4CAF50' }}>
                  <MessageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Quick Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send us a message through our interactive contact form
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                borderRadius: 1.5,
                background: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                mb: 4
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  color: '#2c3e50'
                }}
              >
                Send us a Message
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        marginTop: 0,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#4CAF50' },
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                        },
                        '& .MuiInputLabel-root': {
                          marginTop: 0, // Sets the label's top margin to 0
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        marginTop: 0,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#4CAF50' },
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                        },
                        '& .MuiInputLabel-root': {
                          marginTop: 0, // Sets the label's top margin to 0
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        marginTop: 0,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#4CAF50' },
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                        },
                        '& .MuiInputLabel-root': {
                          marginTop: 0, // Sets the label's top margin to 0
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      sx={{
                        marginTop: 0,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          padding: '18px 80px',
                          '& textarea': {
                            padding: 0,
                          },
                          '&:hover fieldset': { borderColor: '#4CAF50' },
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                        },
                        '& .MuiInputLabel-root': {
                          marginTop: 0, // Sets the label's top margin to 0
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: '#4CAF50',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#45a049' },
                        '&:disabled': { bgcolor: '#ccc' }
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ px: 9, py: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    color: '#2c3e50'
                  }}
                >
                  Get in Touch
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: 'stretch',
                      justifyContent: 'space-between',
                      gap: { xs: 2, md: 2 },
                    }}>
                      {contactInfo.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            p: { xs: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: 'transparent',
                            boxShadow: 'none',
                            border: '1px solid #f0f0f0',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: '#f8f9fa',
                            },
                          }}
                        >
                          <Avatar sx={{ bgcolor: '#f8f9fa', width: 60, height: 32 }}>
                            {item.icon}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.25, fontSize: '1rem' }}>
                              {item.title}
                            </Typography>
                            {item.details.map((detail, idx) => (
                              <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                                {detail}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Social Media Links */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      sx={{
                        bgcolor: social.color,
                        color: 'white',
                        width: 45,
                        height: 45,
                        '&:hover': {
                          bgcolor: social.color,
                          opacity: 0.8,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      title={social.label}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactUs;
