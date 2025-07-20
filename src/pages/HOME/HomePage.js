import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent,
  //CardActionArea,
  Button, 
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Fade,
  Grow,
  Slide,
  Chip,
  Divider,
  Avatar,
  Stack,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  //useMediaQuery,
  alpha,
  //radioClasses
} from '@mui/material';
import { 
  Chat, 
  ArrowDownward, 
  CheckCircle, 
  ExpandMore,
  TrendingUp, 
  LocalShipping, 
  ShoppingBasket, 
  Agriculture,
  EmojiEvents,
  HandshakeOutlined,
  Speed,
  Security,
  MonetizationOn,
  AccessTime,
  HelpOutline,
  //Phone,
  PhoneAndroid
} from '@mui/icons-material';
import { HeaderWithTheme } from './Header';
import { ColorModeContext } from './Header';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import Services from './Services';
import Footer from './Footer';
import { motion } from 'framer-motion'; // You'll need to install framer-motion for animations

// Stats Data
const statsData = [
  { value: '3,000+', label: 'Successful Transactions', icon: <CheckCircle color="success" /> },
  { value: '20M+', label: 'Farmer Revenue Generated', icon: <MonetizationOn color="secondary" /> },
  { value: '1,000+', label: 'Active Users', icon: <TrendingUp color="primary" /> },
  { value: '95%', label: 'Satisfaction Rate', icon: <EmojiEvents style={{ color: '#f39c12' }} /> },
];

// FAQ Data
const faqData = [
  {
    question: "How do I get started as a farmer on the platform?",
    answer: "Sign up using the 'Join as Farmer' button, complete your profile with your farm details, upload photographs of your produce, and start listing your harvests. Our team will verify your information, and you'll be ready to connect with merchants."
  },
  {
    question: "How are prices determined for agricultural products?",
    answer: "Prices are determined through our transparent bidding system. As a farmer, you set a minimum price for your produce. Merchants can then place bids, and you have the freedom to accept the offer that works best for you."
  },
  {
    question: "What types of transportation options are available?",
    answer: "Our platform connects you with a variety of transportation providers, from small local vehicles to large transport fleets. Transporters list their vehicle types, capacities, and rates so you can choose the best option for your specific needs."
  },
  {
    question: "How does the payment system work?",
    answer: "We offer a secure payment system. When a deal is made, the merchant deposits funds that are held securely until the produce is delivered and confirmed received. This protects both parties and ensures timely payments."
  },
  {
    question: "Can I track my delivery in real-time?",
    answer: "Yes, our platform offers real-time tracking for all deliveries. Once a transporter picks up your produce, you'll receive updates on the delivery progress and estimated arrival time."
  },
];

// Testimonial Data
const testimonials = [
  {
    name: "Kavish Perera",
    role: "Farmer",
    location: "Nuwara Eliya",
    image: "/Images/home/testimonial1.jpg", // You'll need to add these images
    rating: 5,
    text: '"Since joining Farmer to Market, my income has increased by 40%. I no longer worry about finding buyers for my harvest!"'
  },
  {
    name: "Asela Fernando",
    role: "Merchant",
    location: "Colombo",
    image: "/Images/home/testimonial2.jpg",
    rating: 5,
    text: '"This platform has transformed how we source produce. We get fresher products at better prices, and our customers notice the difference."'
  },
  {
    name: "Kevin Selvan",
    role: "Transporter",
    location: "Colombo",
    image: "/Images/home/testimonial3.jpeg",
    rating: 4,
    text: '"My delivery business has grown 3x since I joined. The platform connects me directly with clients who need my services."'
  }
];

// How It Works Steps
const howItWorksSteps = [
  {
    role: "Farmer",
    steps: [
      "Sign up and create your profile",
      "List your harvest with details and photos",
      "Receive and accept bids from merchants",
      "Coordinate pickup with transporters"
    ],
    icon: <Agriculture fontSize="large" sx={{ color: '#4CAF50' }} />
  },
  {
    role: "Merchant",
    steps: [
      "Browse available harvests by type, location, and price",
      "Place competitive bids on quality produce",
      "Arrange transportation through the platform",
      "Receive delivery and complete payment"
    ],
    icon: <ShoppingBasket fontSize="large" sx={{ color: '#f39c12' }} />
  },
  {
    role: "Transporter",
    steps: [
      "Register your vehicles and service areas",
      "View available transportation requests",
      "Accept jobs that match your capacity",
      "Complete deliveries and grow your business"
    ],
    icon: <LocalShipping fontSize="large" sx={{ color: '#3498db' }} />
  }
];

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// HomePage Component
const HomePage = () => {
  const [language, setLanguage] = useState("English");
  const [activeTab, setActiveTab] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mode, setMode] = useState('light'); 
  
  const navigate = useNavigate();
  //const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [activeSlide, setActiveSlide] = useState(0);
const heroImages = [
  "/Images/home/hero-illustration.png",
  "/Images/home/hero-illustration-2.png", 
  "/Images/home/hero-illustration-3.png"
];
  
  // Refs for scroll sections
  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  
  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = [
      heroRef.current,
      howItWorksRef.current,
      statsRef.current,
      testimonialsRef.current,
      faqRef.current
    ];
    
    sections.forEach(section => {
      if (section) observer.observe(section);
    });
    
    return () => sections.forEach(section => {
      if (section) observer.unobserve(section);
    });
  }, []);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  // Add this effect for auto-rotation of slides
useEffect(() => {
  const timer = setInterval(() => {
    setActiveSlide((prev) => (prev + 1) % heroImages.length);
  }, 5000); // Change slide every 5 seconds
  
  return () => clearInterval(timer);
}, [heroImages.length]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSignUpClick = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate('/register');
  };
  
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Create the color mode context value
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // Create the theme based on mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#4CAF50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#fff',
          },
          secondary: {
            main: '#f1c40f',
            light: '#f4d03f',
            dark: '#f39c12',
            contrastText: '#000',
          },
          success: {
            main: '#2ecc71',
            contrastText: '#fff',
          },
          error: {
            main: '#e74c3c',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
          primary: mode === 'dark' ? '#f5f5f5' : '#2d472d',
          secondary: mode === 'dark' ? '#C0C0C0' : '#4d4d4d',
          },
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            '@media (max-width:600px)': {
              fontSize: '2.5rem',
            },
          },
          h2: {
            fontSize: '2.8rem',
            fontWeight: 600,
            '@media (max-width:600px)': {
              fontSize: '2rem',
            },
          },
          h3: {
            fontSize: '2.2rem',
            fontWeight: 600,
            '@media (max-width:600px)': {
              fontSize: '1.8rem',
            },
          },
          h4: {
            fontSize: '1.8rem',
            fontWeight: 600,
          },
          h5: {
            fontSize: '1.4rem',
            fontWeight: 500,
          },
          h6: {
            fontSize: '1.2rem',
            fontWeight: 500,
          },
          body1: {
            fontSize: '1.1rem',
            lineHeight: 1.7,
          },
          body2: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
          },
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '10px 20px',
              },
              contained: {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
        },
      }),
    [mode],
  );

  // Apply dark mode to body (optional)
  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#121212' : '#ffffff';
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <HeaderWithTheme language={language} setLanguage={setLanguage} />

    {/* Main content container with margin-top to avoid header overlap */}
    <Box
        sx={{
          pt: '60px', // Add padding-top to account for the fixed header height
        
         
        }}
      ></Box>

      <CssBaseline />
      <Box component={motion.div} initial="hidden" animate="visible" variants={containerVariants}>
        {/* Hero Section with Dynamic Background */}
        <Box
          ref={heroRef}
          id="hero-section"
          sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(36, 46, 36, 0.95), rgba(18, 25, 18, 0.97)), url("/Images/home/bg.png")'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(240, 255, 240, 0.96)), url("/Images/home/bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: theme => theme.palette.mode === 'dark' ? 'white' : '#2d472d',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <HeaderWithTheme language={language} setLanguage={setLanguage} />

          {/* Hero Content */}
          <Container
            maxWidth="lg"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              mt: 10,
            }}
          >
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid size={{ xs: 12, md: 8 }} component={motion.div} variants={itemVariants}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 5 }}>
                  <Typography 
                    variant="h1"
                    sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      maxWidth: { xs: '100%', md: '90%' },
                      
                    }}
                  >
                    Revolutionizing Farm-to-Market
                  </Typography>
                  
                  <Typography variant="h4" 
                    sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? '#f1c40f' : '#2d472d',
                      fontWeight: 400,
                      mb: 3
                    }}
                  >
                    Connect. Trade. Deliver.
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 4,
                      fontWeight: 400,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      maxWidth: { xs: '100%', md: '80%' },
                      mx: { xs: 'auto', md: 0 },
                    }}
                  >
                    A seamless platform connecting farmers, merchants, and transporters 
                    for efficient agricultural trade and transportation.
                  </Typography>
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                    justifyContent={{ xs: 'center', md: 'flex-start' }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => scrollToSection(howItWorksRef)}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 14px rgba(76, 175, 80, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 20px rgba(76, 175, 80, 0.6)',
                        }
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      endIcon={<ArrowDownward />}
                      sx={{
                        borderColor: theme => theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50',
                        color: theme => theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50',
                        '&:hover': {
                          borderColor: theme => theme.palette.mode === 'dark' ? '#f4d03f' : '#81C784',
                          backgroundColor: 'rgba(76, 175, 80, 0.04)',
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </Box>
              </Grid>
              
              {/* Hero Image Slider */}
              <Grid size={{ xs: 12, md: 4 }} component={motion.div} variants={itemVariants}>
                <Box sx={{ 
                  position: 'relative', 
                  width: '100%',
                  maxWidth: '450px',
                  mx: 'auto',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: theme => theme.palette.mode === 'dark' 
                    ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                    : '0 10px 30px rgba(0, 0, 0, 0.15)',
                }}>
                  
              {/* Slider images */}
              <Box sx={{ position: 'relative', height: 300 }}>
                    {heroImages.map((img, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={img}
                        alt={`Farm to Market ${index + 1}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: activeSlide === index ? 1 : 0,
                          transition: 'opacity 0.8s ease-in-out',
                          filter: theme => theme.palette.mode === 'dark' 
                            ? 'drop-shadow(0 0 12px rgba(241, 196, 15, 0.5))' 
                            : 'drop-shadow(0 8px 16px rgba(0, 150, 0, 0.2))',
                          animation: activeSlide === index ? 'float 6s ease-in-out infinite' : 'none',
                          '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-20px)' },
                          }
                        }}
                      />
                    ))}
                  </Box>
                  
                  {/* Navigation dots */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    position: 'absolute', 
                    bottom: 16, 
                    left: 0, 
                    right: 0,
                    zIndex: 2
                  }}>
                    {heroImages.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: index === activeSlide 
                            ? theme.palette.primary.main
                            : 'rgba(255, 255, 255, 0.6)',
                          mx: 0.5,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.2)',
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* Scroll Indicator */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mt: 'auto',
                mb: 'auto',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(10px)' },
                }
              }}
            >
              <IconButton 
                onClick={() => scrollToSection(howItWorksRef)}
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <ArrowDownward color="primary" />
              </IconButton>
            </Box>
          </Container>
        </Box>
                  
        {/* How It Works Section */}
        <Box
          ref={howItWorksRef}
          id="how-it-works"
          sx={{
            py: { xs: 8, md: 12 },
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(to bottom, #1a2a1a, #1f1f1f)'
              : 'linear-gradient(to bottom, #f9fdf9, #f0f7f0)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip 
                label="How It Works" 
                color="primary" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.875rem'
                }} 
              />
              <Typography
                variant="h2"
                gutterBottom
                color="text.primary"
                sx={{ fontWeight: 700, textAlign: 'center' }} // keep other styles
              >
                Your Journey with Farm-to-Market
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
                Our platform connects all parts of the agricultural supply chain, 
                creating a seamless process from farm to market.
              </Typography>
              
              {/* Role Tabs */}
              <Box sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
                <Paper elevation={1} sx={{ borderRadius: '40px', overflow: 'hidden' }}>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    aria-label="user role tabs"
                    sx={{
                      '& .MuiTab-root': {
                        py: 2, 
                        fontWeight: 600,
                        fontSize: '1rem',
                      }
                    }}
                  >
                    <Tab label="Farmer" icon={<Agriculture />} iconPosition="start" />
                    <Tab label="Merchant" icon={<ShoppingBasket />} iconPosition="start" />
                    <Tab label="Transporter" icon={<LocalShipping />} iconPosition="start" />
                  </Tabs>
                </Paper>
              </Box>
              
              {/* Process Flow */}
              <Fade in={true} timeout={1000}>
                <Box>
                  <Stepper 
                    activeStep={-1} 
                    alternativeLabel
                    sx={{ 
                      maxWidth: 900, 
                      mx: 'auto',
                      flexWrap: 'wrap',
                      '& .MuiStepLabel-label': {
                        mt: 1,
                        fontSize: '1rem'
                      }
                    }}
                  >
                    {howItWorksSteps[activeTab].steps.map((step, index) => (
                      <Step key={index} completed={false}>
                        <StepLabel 
                          StepIconProps={{ 
                            icon: index + 1,
                            sx: { 
                              width: 40, 
                              height: 40, 
                              border: '2px solid #4CAF50',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            } 
                          }}
                        >
                          {step}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  
                  {/* Mobile Process Flow */}
                  <Box sx={{ mt: 4, display: { xs: 'block', md: 'none' } }}>
                    {howItWorksSteps[activeTab].steps.map((step, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main',
                            mr: 2,
                            width: 36,
                            height: 36,
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Typography variant="body1">{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Fade>
            </Box>
            
            {/* Role Cards */}
            <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              {/* Farmer Card */}
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card 
                  elevation={4}
                  sx={{ 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? alpha('#1e4620', 0.7)
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(76, 175, 80, 0.3)'
                      : 'rgba(76, 175, 80, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)',
                      borderColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(76, 175, 80, 0.5)'
                        : 'rgba(76, 175, 80, 0.4)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height={220}
                      image="/Images/home/farmer_home.jpg"
                      alt="Farmer"
                      sx={{
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                    <Chip 
                      label="Join 3,000+ Farmers" 
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="div" fontWeight="bold" align="center">
                      Farmer
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        List your harvests, connect with merchants, and get fair prices for your produce.
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        Benefits:
                      </Typography>
                      
                      <Stack spacing={1}>
                        {[
                          "Direct access to merchants - no middlemen",
                          "Higher profits through competitive bidding",
                          "Simplified logistics & transportation",
                          "Guaranteed, secure payments"
                        ].map((benefit, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle color="success" sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2" color="text.secondary">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => handleSignUpClick('farmer')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 14px rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      JOIN AS FARMER
                    </Button>
                  </Box>
                </Card>
              </Grid>
              
              {/* Merchant Card */}
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card 
                  elevation={4}
                  sx={{ 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? alpha('#3d3200', 0.7)
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(241, 196, 15, 0.3)'
                      : 'rgba(241, 196, 15, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)',
                      borderColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(241, 196, 15, 0.5)'
                        : 'rgba(241, 196, 15, 0.4)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height={220}
                      image="/Images/home/merchant_home.jpg"
                      alt="Merchant"
                      sx={{
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                    <Chip 
                      label="Premium Quality Products" 
                      color="secondary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="div" fontWeight="bold" align="center">
                      Merchant
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Browse available harvests, place bids, and source quality produce directly from farmers.
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        Benefits:
                      </Typography>
                      
                      <Stack spacing={1}>
                        {[
                          "Direct sourcing from farms for freshness",
                          "Competitive pricing through transparent bidding",
                          "Quality assurance with verified farmers",
                          "Streamlined delivery coordination"
                        ].map((benefit, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle sx={{ mr: 1, fontSize: 18, color: '#f1c40f' }} />
                            <Typography variant="body2" color="text.secondary">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      fullWidth
                      size="large"
                      onClick={() => handleSignUpClick('merchant')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 'bold',
                        color: '#000',
                        boxShadow: '0 4px 10px rgba(241, 196, 15, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 14px rgba(241, 196, 15, 0.4)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      JOIN AS MERCHANT
                    </Button>
                  </Box>
                </Card>
              </Grid>
              
              {/* Transporter Card */}
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card 
                  elevation={4}
                  sx={{ 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? alpha('#0a3d55', 0.7)
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(52, 152, 219, 0.3)'
                      : 'rgba(52, 152, 219, 0.2)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)',
                      borderColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(52, 152, 219, 0.5)'
                        : 'rgba(52, 152, 219, 0.4)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height={220}
                      image="/Images/home/transporter_home.jpeg"
                      alt="Transporter"
                      sx={{
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                    <Chip 
                      label="Growing Demand" 
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                        bgcolor: '#3498db',
                        color: 'white'
                      }}
                      size="small"
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="div" fontWeight="bold" align="center">
                      Transporter
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Find transportation opportunities, manage deliveries, and grow your business.
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        Benefits:
                      </Typography>
                      
                      <Stack spacing={1}>
                        {[
                          "Consistent delivery opportunities",
                          "Optimized routes for efficiency",
                          "Direct communication with clients",
                          "Secure, timely payment processing"
                        ].map((benefit, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle sx={{ mr: 1, fontSize: 18, color: '#3498db' }} />
                            <Typography variant="body2" color="text.secondary">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      size="large"
                      onClick={() => handleSignUpClick('transporter')}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 'bold',
                        bgcolor: '#3498db',
                        '&:hover': {
                          bgcolor: '#2980b9',
                          boxShadow: '0 6px 14px rgba(52, 152, 219, 0.4)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      JOIN AS TRANSPORTER
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Stats Section */}
        <Box
          ref={statsRef}
          id="stats-section"
          sx={{
            py: { xs: 8, md: 10 },
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? '#0f1c0f'
              : '#eefbee',
          }}
        >
          <Container>
            <Grow in={isVisible['stats-section']} timeout={1000}>
              <Grid container spacing={3} alignItems="center">
                {statsData.map((stat, index) => (
                  <Grid size={{ xs: 6, md: 3 }} key={index}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        background: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        {stat.icon}
                      </Box>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          fontSize: { xs: '1.8rem', md: '2.2rem' } 
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grow>
          </Container>
        </Box>
        
        {/* Testimonial Section */}
        <Box
          ref={testimonialsRef}
          id="testimonials"
          sx={{
            py: { xs: 8, md: 12 },
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? '#1a1a1a'
              : '#f5f5f5',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip 
                label="Testimonials" 
                color="primary" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.875rem'
                }} 
              />
              <Typography variant="h2" gutterBottom  color="text.primary" sx={{ fontWeight: 700 , textAlign: 'center' }}>
                Success Stories
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: '700px', mx: 'auto' }}>
                Hear from farmers, merchants, and transporters who have transformed their businesses
                with our platform.
              </Typography>
            </Box>
            
            <Slide in={isVisible['testimonials']} direction="up" timeout={800}>
              <Box>
                <Grid container spacing={4} justifyContent="center">
                  <Grid size={{ xs: 12, md: 12, lg: 10 }}>
                    <Card
                      elevation={4}
                      sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        background: theme => theme.palette.mode === 'dark' 
                          ? 'linear-gradient(145deg, #222 30%, #333 90%)'
                          : 'linear-gradient(145deg, #fff 30%, #f8f8f8 90%)',
                        boxShadow: theme => theme.palette.mode === 'dark'
                          ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                          : '0 10px 30px rgba(0, 0, 0, 0.08)',
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 2 }}>
                        <Grid container spacing={4} alignItems="center">
                          <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
                              <Avatar
                                src={testimonials[testimonialIndex].image}
                                alt={testimonials[testimonialIndex].name}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  mb: 2,
                                  border: '4px solid',
                                  borderColor: theme => theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(255, 255, 255, 0.8)',
                                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                              <Typography variant="h6" fontWeight="bold">
                                {testimonials[testimonialIndex].name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {testimonials[testimonialIndex].role} from {testimonials[testimonialIndex].location}
                              </Typography>
                              <Rating value={testimonials[testimonialIndex].rating} readOnly sx={{ mt: 1 }} />
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12, md: 7 }}>
                            <Box sx={{ position: 'relative' }}>

                            
                              <Typography
                                variant="body1"
                                sx={{
                                  fontSize: { xs: '1rem', md: '1.2rem' },
                                  fontStyle: 'italic',
                                  lineHeight: 1.7,
                                  position: 'relative',
                                  '&:before': {
                                    content: '""',
                                    fontSize: '4rem',
                                    color: theme => theme.palette.mode === 'dark'
                                      ? 'rgba(255, 255, 255, 0.1)'
                                      : 'rgba(0, 0, 0, 0.06)',
                                    position: 'absolute',
                                    top: -30,
                                    left: -10,
                                  }
                                }}
                              >
                                {testimonials[testimonialIndex].text}
                              </Typography>

                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {/* Navigation Dots */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
                        {testimonials.map((_, index) => (
                          <Box
                            key={index}
                            onClick={() => setTestimonialIndex(index)}
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: index === testimonialIndex
                                ? 'primary.main'
                                : theme => theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.2)'
                                  : 'rgba(0, 0, 0, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: index === testimonialIndex
                                  ? 'primary.dark'
                                  : theme => theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.3)'
                                    : 'rgba(0, 0, 0, 0.2)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Slide>
          </Container>
        </Box>
        
        {/* FAQ Section */}
        <Box
          ref={faqRef}
          id="faq"
          sx={{
            py: { xs: 8, md: 10 },
            background: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(to bottom, #1f1f1f, #0f1f0f)'
              : 'linear-gradient(to bottom, #ffffff, #f0f7f0)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip 
                label="FAQ" 
                color="primary" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.875rem'
                }} 
              />
              <Typography variant="h2" color="text.primary"  gutterBottom sx={{ fontWeight: 700 , textAlign: 'center'}}>
                Frequently Asked Questions
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: '700px', mx: 'auto', mb: 2 }}>
                Find answers to common questions about our platform and how it works.
              </Typography>
            </Box>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid size={{ xs: 12, md: 12, lg: 10 }}>
                <Fade in={isVisible['faq']} timeout={1000}>
                  <Box>
                    {faqData.map((faq, index) => (
                      <Accordion
                        key={index}
                        sx={{
                          mb: 2,
                          borderRadius: '12px !important',
                          overflow: 'hidden',
                          '&:before': { display: 'none' },
                          boxShadow: theme => theme.palette.mode === 'dark'
                            ? '0 2px 8px rgba(0,0,0,0.4)'
                            : '0 2px 8px rgba(0,0,0,0.05)',
                          border: '1px solid',
                          borderColor: theme => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{
                            transition: 'background 0.2s',
                            '&:hover': {
                              backgroundColor: theme => theme.palette.mode === 'dark' ? '#333366' : 'rgba(76,175,80,0.08)',
                              '& .MuiTypography-root': {
                                color: theme => theme.palette.mode === 'dark' ? '#fefcfb' : '#388e3c',
                              },
                            },
                            '& .MuiAccordionSummary-content': {
                              margin: '16px 0',
                            }
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={500}
                            sx={{
                              color: theme => theme.palette.mode === 'dark' ? '#388e3c' : theme.palette.text.primary,
                              transition: 'color 0.2s'
                            }}
                          >
                            {faq.question}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Typography variant="body1" color="#283618">
                            {faq.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </Fade>
                
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Can't find what you're looking for?
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<HelpOutline />}
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    sx={{
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px'
                      }
                    }}
                  >
                    Contact Support
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Platform Benefits Section */}
        <Box
          sx={{
            py: { xs: 8, md: 10 },
            backgroundColor: theme => theme.palette.mode === 'dark'
              ? '#171c17'
              : '#f9f9f9',
          }}
        >
          <Container>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip 
                label="Platform Benefits" 
                color="primary" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.875rem'
                }} 
              />
              <Typography variant="h2"  color="text.primary"  gutterBottom sx={{ fontWeight: 700 , textAlign: 'center' }}>
                Why Choose Farm-to-Market?
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
                Our platform offers numerous advantages to all stakeholders in the agricultural ecosystem.
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {[
                {
                  icon: <HandshakeOutlined sx={{ fontSize: 40, color: '#4CAF50' }} />,
                  title: "Direct Connections",
                  description: "Connect directly with buyers, sellers, and transporters without intermediaries, ensuring better prices and relationships."
                },
                {
                  icon: <Speed sx={{ fontSize: 40, color: '#f1c40f' }} />,
                  title: "Efficiency",
                  description: "Streamlined processes for listing, bidding, and delivery coordination save time and reduce administrative burden."
                },
                {
                  icon: <Security sx={{ fontSize: 40, color: '#3498db' }} />,
                  title: "Secure Transactions",
                  description: "Our system ensures safe payments and builds trust between all parties involved in transactions."
                },
                {
                  icon: <MonetizationOn sx={{ fontSize: 40, color: '#e74c3c' }} />,
                  title: "Better Prices",
                  description: "Farmers receive higher profits while merchants access better pricing through direct trade and competitive bidding."
                },
                {
                  icon: <AccessTime sx={{ fontSize: 40, color: '#9b59b6' }} />,
                  title: "Real-time Updates",
                  description: "Track your harvest listings, bids, and deliveries with real-time notifications and status updates."
                },
                {
                  icon: <PhoneAndroid sx={{ fontSize: 40, color: '#1abc9c' }} />,
                  title: "Mobile Friendly",
                  description: "Access all features on the go with our responsive mobile interface designed for field use."
                }
              ].map((benefit, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderRadius: 4,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {benefit.icon}
                    </Box>
                    <Typography variant="h5" color="#0f1c0f"  gutterBottom fontWeight={600}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="#0f1c0f">
                      {benefit.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))} 
            </Grid>
          </Container>
        </Box>
        
        {/* About, Services, Contact sections from original homepage */}
        <Box id="about">
          <AboutUs />
        </Box>
        
        <Box id="service">
          <Services />
        </Box>
        
        <Box id="contact">
          <ContactUs />
        </Box>
        
        {/* App Download Promotion */}
        <Box
          sx={{
            py: { xs: 8, md: 10 },
            backgroundColor: theme => theme.palette.mode === 'dark'
              ? '#0a2e0a'
              : '#e8f5e9',
            textAlign: 'center',
          }}
        >
          <Container>
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
                  <Typography variant="h3" gutterBottom fontWeight={700}>
                    Take Farm-to-Market with You
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                    Download our mobile app to access all features on the go.
                    List products, place bids, and track deliveries from anywhere.
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 3,
                        fontWeight: 'bold',
                        borderRadius: '12px',
                      }}
                      startIcon={<img src="/Images/home/google-play.png" alt="Google Play" width="24" />}
                    >
                      Google Play
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 3,
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px'
                        }
                      }}
                      startIcon={<img src="/Images/home/app-store.png" alt="App Store" width="24" />}
                    >
                      App Store
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  component="img"
                  src="/Images/home/app-mockup.jpg" // You'll need to add this mockup image
                  alt="Mobile App"
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '500px',
                    filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15))',
                    borderRadius: '12px',
                    transition: 'transform 0.3s',
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Support Button */}
        <IconButton
          aria-label="Contact Support"
          onClick={() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: theme => theme.palette.primary.main,
            color: 'white',
            width: 60,
            height: 60,
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.dark,
              transform: 'scale(1.1)',
            },
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          <Chat />
          <Tooltip title="Contact Support" placement="left">
            <span></span>
          </Tooltip>
        </IconButton>
        
        <Footer />
      </Box>
    </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export { HeaderWithTheme };
export default HomePage;