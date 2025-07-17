import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';

const AboutUs = () => {
  const aboutUsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (aboutUsRef.current) observer.observe(aboutUsRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={aboutUsRef}
      sx={{
        width: '100%',
        py: 8,
        mb: 4,
        background: 'linear-gradient(135deg, #eff1f7ff 0%, #1e40af 50%, #059669 100%)',
        color: 'white',
        borderRadius: '1rem',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
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
                mb: 3, 
                fontWeight: '800',
                fontSize: '3rem',
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
              }}
            >
              About Us
            </Typography>
            <Typography variant="body1" 
              sx={{
                mb: 3,
                fontSize: '1.2rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
              }}
              paragraph
            >
              Farm-to-Market connects Farmers, Merchants, and Transporters for a seamless harvest journey.
              By eliminating middlemen, we ensure fair pricing and efficient transactions.
            </Typography>
            <List sx={{ 
              '& .MuiListItem-root': {
                padding: '8px 0',
                '&::before': {
                  content: '"✓"',
                  color: '#10b981',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  marginRight: '12px'
                }
              }
            }}>
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ListItemText 
                  primary="Empowers farmers by providing direct marketplace access."
                  primaryTypographyProps={{
                    sx: {
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ListItemText 
                  primary="Merchants can filter, bid, and buy harvests securely."
                  primaryTypographyProps={{
                    sx: {
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <ListItemText 
                  primary="Transporters streamline delivery for a complete ecosystem."
                  primaryTypographyProps={{
                    sx: {
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6} 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out'
            }}
          >
            <Box
              component="img"
              src="/Images/home/about-us.jpg"  
              alt="About Us"
              sx={{
                width: '85%',
                maxWidth: '500px',
                borderRadius: '1.5rem',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutUs;