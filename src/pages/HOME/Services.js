import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card } from '@mui/material';

const Services = () => {
  const servicesRef = useRef(null);
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

    if (servicesRef.current) observer.observe(servicesRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      id="service"
      ref={servicesRef}
      sx={{
        width: '100%',
        py: 6,
        mb: 3,
        background: 'linear-gradient(to right, #3F51B5, #719e45)',
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
              Our Services
            </Typography>
            <Typography variant="body1" paragraph>
              We provide a comprehensive suite of services connecting all parts of the agricultural supply chain.
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { title: "Harvest Listings", description: "Farmers can list their harvests with detailed information" },
                { title: "Bidding System", description: "Merchants can place competitive bids on available produce" },
                { title: "Transport Coordination", description: "Transporters can offer shipping services for completed transactions" },
                { title: "Secure Payments", description: "Our platform ensures secure and timely payments for all parties" }
              ].map((service, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    paddingLeft: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}>
                        
                    <>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {service.title}
                      </Typography>
                      <Typography variant="body2">
                        {service.description}
                      </Typography>
                    </>

                    <Box sx={{ 
                          p: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}></Box>

                  </Card>
                </Grid>
              ))}
            </Grid>
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
              src="/Images/home/services.jpg"
              alt="Our Services"
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

export default Services;
