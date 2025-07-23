import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaLeaf } from "react-icons/fa";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Fade,
  Avatar,
  Stack,
  Zoom,
  Divider,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { green, grey } from '@mui/material/colors';

function LoginPage() {
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const checkUserExists = async () => {
      if (isAuthenticated && user) {
        setChecking(true);
        try {
          await getAccessTokenSilently({ detailedResponse: true });
          const roles = user["https://harvest-system.com/claims/roles"];
          
          if (roles && roles.includes("admin")) {
            navigate("/admin/dashboard");
            return;
          }
          
          const res = await fetch(`http://localhost:5000/api/users/check/${user.sub}`);
          const data = await res.json();
          if (data.exists) {
            navigate('/');
          }
        } catch (err) {
          console.error("Error checking user existence:", err);
        } finally {
          setChecking(false);
        }
      }
    };
    
    checkUserExists();
  }, [isAuthenticated, user, getAccessTokenSilently, navigate]);

  // Loading state UI with skeleton
  if (isLoading || checking) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#3a5a40',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress color="success" size={60} thickness={4.5} />
        <Typography variant="h6" color="white" fontWeight={500}>
          {isLoading ? "Initializing..." : "Checking user details..."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Left side with image (hidden on mobile) */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            flex: { md: 1 },
            display: { xs: 'none', md: 'flex' },
            position: 'relative',
            bgcolor: '#3a5a40',
            minHeight: '100vh',
            overflow: 'hidden'
          }}
        >
          <Box
            component="div"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(58, 90, 64, 0.6)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4
            }}
          >
            <FaLeaf size={70} color="white" />
            <Typography
              variant="h2"
              fontWeight={700}
              color="white"
              sx={{ mt: 3, textAlign: 'center', letterSpacing: 1 }}
            >
              Farm-to-Market
            </Typography>
            <Typography
              variant="body1"
              color="white"
              sx={{ mt: 2, textAlign: 'center', maxWidth: 400, opacity: 0.9 }}
            >
              Your sustainable farming management platform
            </Typography>
          </Box>
          
          <img
            src={`${process.env.PUBLIC_URL}/Images/pexels.jpg`}
            alt="Agriculture landscape"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'all 0.5s ease-in-out',
              opacity: imgLoaded ? 1 : 0,
              filter: 'brightness(0.85)'
            }}
            onLoad={() => setImgLoaded(true)}
          />
        </Box>
      </Fade>

      {/* Right side with login form */}
      <Box
        sx={{
          flex: { md: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          minHeight: '100vh',
          position: 'relative',
          p: { xs: 2, md: 4 }
        }}
      >
        {/* Mobile header */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            alignItems: 'center',
            bgcolor: '#3a5a40',
            p: 2,
            mb: 3
          }}
        >
          <FaLeaf size={25} color="white" />
          <Typography variant="h6" color="white" sx={{ ml: 2, fontWeight: 600 }}>
            Farm-to-Market
          </Typography>
        </Box>

        <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Zoom in timeout={800}>
            <Paper 
              elevation={isMobile ? 0 : 3} 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: 4, 
                mt: { xs: 8, md: 0 },
                boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0,0,0,0.08)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box textAlign="center" mb={4} width="100%">
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  color="#3a5a40"
                  sx={{ 
                    fontSize: { xs: 28, sm: 32 }, 
                    letterSpacing: 0.5,
                    mb: 1,
                    background: `linear-gradient(to right, ${green[700]}, ${green[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  fontSize={16}
                >
                  {isAuthenticated ? 'You are logged in' : 'Please sign in to continue'}
                </Typography>
              </Box>

              {isAuthenticated ? (
                <Fade in timeout={500}>
                  <Box textAlign="center" width="100%">
                    <Stack direction="column" alignItems="center" spacing={3} width="100%">
                      <Avatar 
                        src={user.picture} 
                        alt={user.name} 
                        sx={{ 
                          width: 80, 
                          height: 80,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: '3px solid white'
                        }} 
                      />
                      
                      <Box>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          color="#3a5a40"
                          sx={{ fontSize: 20 }}
                        >
                          {user.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ fontSize: 15, mt: 0.5 }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ 
                            fontWeight: 600, 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            fontSize: 16, 
                            py: 1.2,
                            bgcolor: green[600],
                            '&:hover': { bgcolor: green[700] },
                            width: '100%'
                          }}
                          onClick={() => navigate('/')}
                        >
                          Go to Dashboard
                        </Button>
                        
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          sx={{ 
                            mt: 2, 
                            fontWeight: 600, 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            fontSize: 16, 
                            py: 1.2,
                            width: '100%'
                          }}
                          onClick={() => logout({ returnTo: window.location.origin })}
                        >
                          Sign Out
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </Fade>
              ) : (
                <Fade in timeout={500}>
                  <Box 
                    component="form" 
                    noValidate 
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Stack
                      spacing={2}
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        width: '100%',
                        ml: 8,
                        maxWidth: '100%'
                      }}
                    >
                      {/* Sign in with Email Button */}

                      <Button
                        type="button"
                        variant="contained"
                        sx={{
                          fontWeight: 600,
                          fontSize: 16,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          py: 1.5,
                          bgcolor: green[600],
                          '&:hover': { bgcolor: green[700] },
                          width: '80%',
                          maxWidth: 300,
                          ml: 'auto',
                          mr: 0
                        }}
                        onClick={() => loginWithRedirect()}
                      >
                        Sign in with Email
                      </Button>

                      {/* OR Divider */}
                      <Box sx={{ width: '80%', maxWidth: 300, display: 'flex', alignItems: 'center', my: 1, ml: 'auto', mr: 0 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                          
                        </Typography>
                        <Divider sx={{ flex: 1 }} />
                      </Box>

                      {/* Sign in with Google Button */}
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<FaGoogle size={18} />}
                        sx={{
                          color: grey[700],
                          borderColor: grey[300],
                          fontWeight: 600,
                          fontSize: 16,
                          borderRadius: 2,
                          textTransform: 'none',
                          py: 1.5,
                          '&:hover': {
                            borderColor: green[600],
                            color: green[600],
                            bgcolor: 'rgba(76, 175, 80, 0.04)'
                          },
                          width: '80%',
                          maxWidth: 300,
                          ml: 'auto',
                          mr: 0
                        }}
                        onClick={() => loginWithRedirect({ connection: "google-oauth2" })}
                      >
                        Sign in with Google
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              )}
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center" 
                sx={{ mt: 4, fontSize: 13, width: '100%' }}
              >
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    </Box>
  );
}

export default LoginPage;