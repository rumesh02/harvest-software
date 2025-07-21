import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent
} from '@mui/material';

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

  const services = [
    { 
      title: "Harvest Listings", 
      description: "Farmers can list their harvests with detailed information including quality, quantity, and pricing.",
      icon: "🌾"
    },
    { 
      title: "Bidding System", 
      description: "Merchants can place competitive bids on available produce with real-time updates and notifications.",
      icon: "💰"
    },
    { 
      title: "Transport Coordination", 
      description: "Transporters can offer shipping services for completed transactions with route optimization.",
      icon: "🚚"
    },
    { 
      title: "Secure Payments", 
      description: "Our platform ensures secure and timely payments for all parties with multiple payment options.",
      icon: "🔒"
    }
  ];

  return (
    <Box
      id="service"
      ref={servicesRef}
      sx={{
        width: '100%',
        py: { xs: 4, sm: 5, md: 6, lg: 7 },
        px: { xs: 1, sm: 2 },
        mb: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, #081c15 0%, #183a37 25%, #432534 50%, #463f3a 75%, #6b705c 100%)',
        color: 'white',
        borderRadius: { xs: 1, sm: 2 },
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        boxShadow: '0 20px 60px rgba(8, 28, 21, 0.5)',
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
              color: '#c0c0c0',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)',
              textAlign: { xs: 'center', md: 'left' },
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            Our Services
          </Typography>
          <Typography variant="body1" 
            sx={{ 
              mb: { xs: 3, md: 4 },
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
              lineHeight: '1.7',
              color: '#d0d0d0',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)',
              textAlign: { xs: 'center', md: 'left' },
              fontWeight: '400'
            }}
          >
            We provide a comprehensive suite of services connecting all parts of the agricultural supply chain.
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: { xs: 2, sm: 3 },
            width: '100%'
          }}>
            {services.map((service, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(138, 129, 124, 0.15) 0%, rgba(107, 112, 92, 0.2) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(70, 63, 58, 0.4)',
                  borderRadius: '16px',
                  transition: 'all 0.4s ease',
                  boxShadow: '0 8px 32px rgba(8, 28, 21, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 25px 50px rgba(24, 58, 55, 0.4)',
                    background: 'linear-gradient(135deg, rgba(138, 129, 124, 0.25) 0%, rgba(107, 112, 92, 0.3) 100%)',
                    borderColor: 'rgba(138, 129, 124, 0.6)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ mr: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {service.icon}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: '600',
                        color: '#a3a380',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)'
                      }}
                    >
                      {service.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#e0e0e0',
                      lineHeight: 1.6,
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
        
        {/* Right Side: Image */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: { xs: 'center', md: 'center' },
            justifyContent: 'center',
            mt: { xs: 0, md: '200px' },
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
          }}
        >
          <Box
            component="img"
            src="/Images/home/services.jpg"
            alt="Our Services"
            sx={{
              width: { xs: '90%', sm: '400px', md: '470px', lg: '520px' },
              maxWidth: '99%',
              height: 'auto',
              borderRadius: { xs: '12px', md: '20px' },
              boxShadow: '0 25px 60px rgba(8, 28, 21, 0.5)',
              border: '3px solid rgba(67, 37, 52, 0.6)',
              transition: 'all 0.4s ease',
              objectFit: 'cover',
              filter: 'sepia(30%) saturate(70%) contrast(110%)',
              '&:hover': {
                transform: 'scale(1.05) rotateY(5deg)',
                boxShadow: '0 30px 80px rgba(24, 58, 55, 0.6)',
                borderColor: 'rgba(138, 129, 124, 0.8)',
                filter: 'sepia(40%) saturate(80%) contrast(115%)'
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Services;
