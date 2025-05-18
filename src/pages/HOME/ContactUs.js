import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, TextField, Button } from '@mui/material';

const ContactUs = () => {
  const contactUsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
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
                sx={{
                  mt: 2,
                  bgcolor: '#f8b400',
                  color: '#000',
                  '&:hover': {
                    bgcolor: '#f1c40f',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(241, 196, 15, 0.4)',
                  },
                  transition: 'all 0.3s',
                  fontWeight: 'bold',
                }}
              >
                Send Message
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
      </Container>
    </Box>
  );
};

export default ContactUs;
