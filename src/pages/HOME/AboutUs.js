import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

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
        py: { xs: 4, sm: 5, md: 6, lg: 7 },
        px: { xs: 1, sm: 2 },
        mb: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 25%, #4b5563 50%, #6b7280 75%, #9ca3af 100%)',
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
        {/* Left Side: Text Content */}
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
              color: '#f5f5dc',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
              textAlign: { xs: 'center', md: 'left' },
              background: 'linear-gradient(135deg, #d4b896, #c8a882)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            About Us
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
            Farm-to-Market connects Farmers, Merchants, and Transporters for a seamless harvest journey.
            By eliminating middlemen, we ensure fair pricing and efficient transactions.
          </Typography>
          <List sx={{ 
            width: '100%',
            maxWidth: '650px',
            '& .MuiListItem-root': {
              padding: { xs: '6px 0', md: '8px 0' },
              alignItems: 'flex-start',
              '&::before': {
                content: '"✓"',
                color: '#c8a882',
                fontWeight: '700',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                marginRight: { xs: '10px', md: '15px' },
                textShadow: '0 2px 4px rgba(200, 168, 130, 0.4)'
              }
            }
          }}>
            <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <ListItemText 
                primary="Empowers farmers by providing direct marketplace access."
                primaryTypographyProps={{
                  sx: {
                    color: '#dde7c7',
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                    lineHeight: '1.6',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                    fontWeight: '400'
                  }
                }}
              />
            </ListItem>
            <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <ListItemText 
                primary="Merchants can filter, bid, and buy harvests securely."
                primaryTypographyProps={{
                  sx: {
                    color: '#c0c0c0',
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                    lineHeight: '1.6',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                    fontWeight: '400'
                  }
                }}
              />
            </ListItem>
            <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <ListItemText 
                primary="Transporters streamline delivery for a complete ecosystem."
                primaryTypographyProps={{
                  sx: {
                    color: '#dde7c7',
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
                    lineHeight: '1.6',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                    fontWeight: '400'
                  }
                }}
              />
            </ListItem>
          </List>
        </Box>

        {/* Right Side: Image */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'center',
            mt: { xs: 0, md: '32px' },
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
          }}
        >
          <Box
            component="img"
            src="/Images/home/about-us.jpg"  
            alt="About Us"
            sx={{
              width: { xs: '90%', sm: '400px', md: '470px', lg: '520px' },
              maxWidth: '99%',
              height: 'auto',
              borderRadius: { xs: '12px', md: '20px' },
              boxShadow: '0 25px 60px rgba(75, 85, 99, 0.5)',
              border: '3px solid rgba(200, 168, 130, 0.7)',
              transition: 'all 0.4s ease',
              objectFit: 'cover',
              '&:hover': {
                transform: 'scale(1.05) rotateY(5deg)',
                boxShadow: '0 30px 80px rgba(107, 114, 128, 0.6)',
                borderColor: 'rgba(212, 184, 150, 0.9)'
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AboutUs;