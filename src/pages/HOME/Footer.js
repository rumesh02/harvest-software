import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, WhatsApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box component="footer" sx={{ 
      width: '100%', 
      backgroundColor: '#2d2d2d', 
      color: 'white', 
      py: 3, 
      textAlign: 'center' 
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>Quick Links</Typography>
            <Box>
              <Typography variant="body2" sx={{ color: '#ccc', my: 1 }}>
                <Link 
                  component="button"
                  variant="body2"
                  color="inherit" 
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                  }}
                  onClick={() => navigate('/terms')}
                >
                  Terms of Service
                </Link>
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#ccc', my: 1 }}>
                <Link 
                  component="button"
                  variant="body2"
                  color="inherit" 
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                  }}
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </Link>
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#ccc', my: 1 }}>
                <Link 
                  href="#faq" 
                  color="inherit" 
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    const faqSection = document.getElementById('faq');
                    if (faqSection) {
                      faqSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                >
                  FAQs
                </Link>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>Contact Us</Typography>
            <Typography variant="body2" sx={{ color: '#ccc', my: 1 }}>
              Email: support@farmto-market.com
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc', my: 1 }}>
              Phone: +123 456 7890
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>Follow Us</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  backgroundColor: '#3b5998', 
                  color: 'white',
                  '&:hover': { 
                    transform: 'scale(1.1)', 
                    opacity: 0.8 
                  }
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  backgroundColor: '#1DA1F2', 
                  color: 'white',
                  '&:hover': { 
                    transform: 'scale(1.1)', 
                    opacity: 0.8 
                  }
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                href="https://wa.me/yourwhatsapplink" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  backgroundColor: '#25D366', 
                  color: 'white',
                  '&:hover': { 
                    transform: 'scale(1.1)', 
                    opacity: 0.8 
                  }
                }}
              >
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ mt: 5, opacity: 0.8, fontSize: '0.7rem' }}>
          &copy; {new Date().getFullYear()} Farm-to-Market. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
