import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
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
        py: { xs: 4, sm: 5, md: 6, lg: 7 },
        px: { xs: 1, sm: 2 },
        mb: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(to right, #22333b, #0c1229)',
        color: 'white',
        borderRadius: { xs: 1, sm: 2 },
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        boxShadow: '0 20px 60px rgba(31, 41, 55, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          width: { xs: '95%', md: '90%', lg: '85%' },
          maxWidth: '1400px',
          minHeight: { md: '500px' },
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* Left Side: Text Content and Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'center',
            mt: { xs: 2, md: 0 },
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
          }}
        >
          <Typography variant="h2" 
            sx={{ 
              mb: { xs: 2, md: 3 }, 
              fontWeight: '700',
              fontSize: { xs: '2rem', sm: '2.4rem', md: '2.8rem', lg: '3.2rem' },
              color: '#f8b400',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
              textAlign: { xs: 'center', md: 'left' },
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            Contact Us
          </Typography>
          <Typography variant="body1" 
            sx={{
              mb: { xs: 3, md: 4 },
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
              lineHeight: '1.7',
              color: 'rgba(229, 231, 235, 0.95)',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
              textAlign: { xs: 'center', md: 'left' },
              fontWeight: '400'
            }}
            paragraph
          >
            Have questions or suggestions? We'd love to hear from you. Fill out the form or reach us through our contact information.
          </Typography>
          
          <Box sx={{ width: '100%', maxWidth: '800px' }}>
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
                size="large"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f8b400' },
                    fontSize: '1.1rem',
                    padding: '4px',
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem'
                  },
                  '& .MuiInputBase-input': { 
                    color: 'white',
                    fontSize: '1.1rem',
                    padding: '16px 14px'
                  },
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
                size="large"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f8b400' },
                    fontSize: '1.1rem',
                    padding: '4px',
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem'
                  },
                  '& .MuiInputBase-input': { 
                    color: 'white',
                    fontSize: '1.1rem',
                    padding: '16px 14px'
                  },
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
                rows={5}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#f8b400' },
                    fontSize: '1.1rem',
                    padding: '4px',
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem'
                  },
                  '& .MuiInputBase-input': { 
                    color: 'white',
                    fontSize: '1.1rem',
                    padding: '16px 14px'
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <Send />}
                sx={{
                  mt: 3,
                  py: 2,
                  px: 4,
                  fontSize: '1.2rem',
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
          </Box>
        </Box>

        {/* Right Side: Image */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: { xs: 'center', md: 'center' },
            justifyContent: 'center',
            mt: { xs: 0, md: 20 },
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
          }}
        >
          <Box
            component="img"
            src="/Images/home/contact-us.jpg"  
            alt="Contact Us"
            sx={{
              width: { xs: '90%', sm: '400px', md: '470px', lg: '520px' },
              maxWidth: '99%',
              height: 'auto',
              borderRadius: { xs: '12px', md: '20px' },
              boxShadow: '0 25px 60px rgba(75, 85, 99, 0.5)',
              border: '3px solid rgba(248, 180, 0, 0.7)',
              transition: 'all 0.4s ease',
              objectFit: 'cover',
              '&:hover': {
                transform: 'scale(1.05) rotateY(5deg)',
                boxShadow: '0 30px 80px rgba(107, 114, 128, 0.6)',
                borderColor: 'rgba(248, 180, 0, 0.9)'
              }
            }}
          />
        </Box>
      </Box>
        
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
    </Box>
  );
};

export default ContactUs;
