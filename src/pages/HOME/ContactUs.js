import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Send, CheckCircle, Error } from '@mui/icons-material';

const ContactUs = () => {
  const contactUsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (contactUsRef.current) observer.observe(contactUsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please fill in all required fields.');
      setShowSnackbar(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error');
      setStatusMessage('Please enter a valid email address.');
      setShowSnackbar(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setStatusMessage(result.message || 'Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' }); // Reset form
      } else {
        setSubmitStatus('error');
        setStatusMessage(result.message || 'Sorry, there was an error submitting your message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setStatusMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
      setShowSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Box
      id="contact"
      ref={contactUsRef}
      sx={{
        width: '100%',
        py: 6,
        mb: 3,
        background: 'linear-gradient(to right, #22333b, #0c1229)',
        color: 'white',
        borderRadius: 2,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
      }}
    >
      <Container>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}
            sx={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out',
            }}
          >
            <Typography variant="h2" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: '#f8b400',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                animation: isVisible ? 'glowText 2s infinite alternate ease-in-out' : 'none',
                '@keyframes glowText': {
                  from: { textShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
                  to: { textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }
                }
              }}
            >
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              Have questions or suggestions? We'd love to hear from you. Fill out the form or reach us through our contact information.
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f8b400' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f8b400' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                multiline
                rows={4}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f8b400' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: 'white' },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                sx={{
                  mt: 2,
                  bgcolor: '#f8b400',
                  color: '#000',
                  '&:hover': {
                    bgcolor: '#f1c40f',
                    transform: isSubmitting ? 'none' : 'translateY(-3px)',
                    boxShadow: isSubmitting ? 'none' : '0 5px 15px rgba(241, 196, 15, 0.4)',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666',
                  },
                  transition: 'all 0.3s',
                  fontWeight: 'bold',
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Grid>
          <Grid item xs={12} md={6} 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out',
              animation: isVisible ? 'floatUpDown 4s infinite ease-in-out' : 'none',
              '@keyframes floatUpDown': {
                '0%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
                '100%': { transform: 'translateY(0)' }
              }
            }}
          >
            <Box
              component="img"
              src="/Images/home/contact-us.jpg"
              alt="Contact Us"
              sx={{
                width: '90%',
                maxWidth: '450px',
                borderRadius: '15px',
                boxShadow: '0px 6px 15px rgba(255, 215, 0, 0.4)'
              }}
            />
          </Grid>
        </Grid>
        
        {/* Success/Error Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={submitStatus}
            icon={submitStatus === 'success' ? <CheckCircle /> : <Error />}
            sx={{
              width: '100%',
              '& .MuiAlert-message': {
                fontWeight: 'bold',
              },
            }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ContactUs;
