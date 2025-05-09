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
        py: 6,
        mb: 3,
        background: 'linear-gradient(to right, #5e503f, #2E7D32)',
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
                animation: isVisible ? 'pulse 2s infinite alternate ease-in-out' : 'none',
                '@keyframes pulse': {
                  from: { transform: 'scale(1)' },
                  to: { transform: 'scale(1.05)' }
                }
              }}
            >
              About Us
            </Typography>
            <Typography variant="body1" paragraph>
              Farm-to-Market connects Farmers, Merchants, and Transporters for a seamless harvest journey.
              By eliminating middlemen, we ensure fair pricing and efficient transactions.
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Empowers farmers by providing direct marketplace access." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Merchants can filter, bid, and buy harvests securely." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Transporters streamline delivery for a complete ecosystem." />
              </ListItem>
            </List>
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
              src="/Images/home/about-us.jpg"  
              alt="About Us"
              sx={{
                width: '90%',
                maxWidth: '500px',
                borderRadius: '15px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutUs;