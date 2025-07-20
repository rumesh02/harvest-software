import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Button,
  Select,
  MenuItem,
  FormControl,
  Container,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Fade
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  DarkMode, 
  LightMode, 
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  KeyboardArrowDown
} from '@mui/icons-material';

// Create theme context
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const Header = ({ language, setLanguage }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State for scroll position
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Access theme context
  const colorMode = React.useContext(ColorModeContext);
  
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      if (isMobile) setDrawerOpen(false);
    }
  };

  const navigationLinks = [
    { name: "Home", id: "hero-section" },
    { name: "About Us", id: "about" },
    { name: "Services", id: "service" },
    { name: "Contact Us", id: "contact" }
  ];

  return (
    <AppBar 
      position="fixed" 
      color="primary"
      elevation={scrolled ? 4 : 0}
      sx={{ 
        backgroundColor: scrolled 
          ? theme.palette.mode === 'dark' 
            ? 'rgba(26, 32, 26, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)' 
          : theme.palette.mode === 'dark' 
            ? 'rgba(26, 32, 26, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        borderBottom: scrolled 
          ? `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#eaeaea'}`
          : 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo and Brand */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: { xs: 1, md: 4 },
            flexGrow: { xs: 1, md: 0 }
          }}>
            <Box 
              component="img" 
              src="/favicon.ico" 
              alt="AgriLink Logo" 
              sx={{ 
                width: { xs: 36, md: 40 }, 
                height: { xs: 36, md: 40 }, 
                mr: 1.5,
                transition: 'transform 0.3s ease',
                backgroundColor: theme.palette.mode === 'light' ? '#333' : 'transparent',
                borderRadius: theme.palette.mode === 'light' ? '8px' : '0px',
                padding: theme.palette.mode === 'light' ? '6px' : '0px',
                boxShadow: theme.palette.mode === 'light' 
                  ? '0 2px 8px rgba(0,0,0,0.15)' 
                  : 'none',
                '&:hover': { transform: 'scale(1.1)' } 
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50', 
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                letterSpacing: '0.5px',
                textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Farm-to-Market
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              flexGrow: 1
            }}>
              {navigationLinks.map((link) => (
                <Button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'white' : '#333',
                    mx: 1,
                    py: 1,
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0%',
                      height: '2px',
                      bottom: '7px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50',
                      transition: 'width 0.3s ease'
                    },
                    '&:hover': {
                      backgroundColor: 'transparent',
                      '&::after': {
                        width: '70%'
                      }
                    }
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side controls */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            {/* Dark Mode Toggle */}
            <Fade in={true} timeout={800}>
              <IconButton 
                onClick={colorMode.toggleColorMode}
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50',
                  borderRadius: '10px',
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(241, 196, 15, 0.1)' 
                      : 'rgba(76, 175, 80, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
                aria-label={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme.palette.mode === 'dark' ? 
                  <LightMode fontSize="small" /> : 
                  <DarkMode fontSize="small" />
                }
              </IconButton>
            </Fade>
            
            {/* Language Selector */}
            <FormControl size="small" sx={{ ml: 1, mr: { xs: 0, md: 1 } }}>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                IconComponent={KeyboardArrowDown}
                sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : '#333',
                  minWidth: { xs: 70, md: 90 },
                  height: 36,
                  fontSize: { xs: 11, md: 13 },
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  '.MuiSelect-select': {
                    py: 0.5,
                    px: { xs: 1, md: 1.5 }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    fontSize: '1.2rem'
                  }
                }}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Sinhala">සිංහල</MenuItem>
                <MenuItem value="Tamil">தமிழ்</MenuItem>
              </Select>
            </FormControl>
            
            {/* Login/Sign Up Button (Desktop) */}
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<AccountCircle />}
                onClick={() => navigate('/login')}
                sx={{
                  ml: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50',
                  color: theme.palette.mode === 'dark' ? '#111' : 'white',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0px 2px 6px rgba(241, 196, 15, 0.25)'
                    : '0px 2px 6px rgba(76, 175, 80, 0.25)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#e6bb0f' : '#43a047',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0px 4px 8px rgba(241, 196, 15, 0.35)'
                      : '0px 4px 8px rgba(76, 175, 80, 0.35)',
                  }
                }}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : '#333',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen && isMobile}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: '75%',
            maxWidth: '300px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1a201a' : '#fff',
            boxShadow: '0px 0px 20px rgba(0,0,0,0.15)',
            pt: 2,
            px: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Menu</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />
        <List>
          {navigationLinks.map((link) => (
            <ListItem key={link.id} disablePadding>
              <ListItemButton 
                onClick={() => scrollToSection(link.id)}
                sx={{
                  py: 1.5,
                  borderRadius: '8px',
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                <ListItemText 
                  primary={link.name}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '1rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 2 }} />
          <ListItem disablePadding>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AccountCircle />}
              onClick={() => {
                navigate('/login');
                setDrawerOpen(false);
              }}
              sx={{
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: theme.palette.mode === 'dark' ? '#f1c40f' : '#4CAF50',
                color: theme.palette.mode === 'dark' ? '#111' : 'white',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#e6bb0f' : '#43a047',
                }
              }}
            >
              Sign In
            </Button>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};


export const HeaderWithTheme = ({ language, setLanguage }) => {

  return (
    <Header language={language} setLanguage={setLanguage} />
  );
};

export default HeaderWithTheme;
