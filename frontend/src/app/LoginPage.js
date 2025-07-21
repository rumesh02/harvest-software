import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";
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
} from '@mui/material';
import { green, grey, teal } from '@mui/material/colors';
const mint = '#CFFFE5';

function LoginPage() {
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    const checkUserExists = async () => {
      if (isAuthenticated && user) {
        setChecking(true);
        // Force get a fresh token to ensure roles claim is present
        await getAccessTokenSilently({ detailedResponse: true });
        const roles = user["https://harvest-system.com/claims/roles"];
        if (roles && roles.includes("admin")) {
          console.log("Redirecting to admin dashboard");
          navigate("/admin/dashboard");
          setChecking(false);
          return;
        }
        // Normal user flow
        try {
          const res = await fetch(`http://localhost:5000/api/users/check/${user.sub}`);
          const data = await res.json();
          if (data.exists) {
            console.log("Redirecting to farmer dashboard");
            navigate('/');
          } else {
            console.log("Redirecting to register");
            navigate('/register');
          }
        } catch (err) {
          console.error("Error checking user existence", err);
        }
        setChecking(false);
      }
    };

    checkUserExists();
  }, [isAuthenticated, user, navigate, getAccessTokenSilently]);

  if (isLoading || checking) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={grey[50]}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  console.log("Auth0 user:", user);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, bgcolor: '#3a5a40' }}>
      {/* Image Section */}
      <Fade in timeout={1200}>
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100vh',
            background: 'transparent',
          }}
        >
          {/* Blurred overlay for #3a5a40 area */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#3a5a40',
              filter: 'blur(12px)',
              zIndex: 1,
            }}
          />
          <img
            src={`${process.env.PUBLIC_URL}/Images/pexels.jpg`}
            alt="Login page image"
            style={{ height: '100vh', width: '50vw', objectFit: 'cover', transition: 'filter 0.7s', borderRadius: '0px', position: 'relative', zIndex: 2 }}
            onLoad={() => setImgLoaded(true)}
          />
        </Box>
      </Fade>
      {/* Form Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <Zoom in timeout={800}>
          <Paper elevation={5} sx={{ width: { xs: '95%', sm: 400 }, p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h3" fontWeight={700} color="success.main" sx={{ fontSize: { xs: 30, sm: 36, md: 40 }, letterSpacing: 1 }}>
                WELCOME BACK!
              </Typography>
              <Typography variant="body1" color="text.secondary" fontSize={17}>
                Please enter your details.
              </Typography>
            </Box>
            {/* Show user details if logged in */}
            {isAuthenticated ? (
              <Box textAlign="center">
                <Stack direction="column" alignItems="center" spacing={2}>
                  <Avatar src={user.picture} alt={user.name} sx={{ width: 56, height: 56, mb: 1, boxShadow: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="success.main">Welcome, {user.name}!</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    sx={{ mt: 2, fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
                    onClick={() => logout({ returnTo: window.location.origin })}
                  >
                    Logout
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box component="form" noValidate>
                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  sx={{ mb: 2, backgroundColor: green[600], fontWeight: 600, fontSize: 17, borderRadius: 2, textTransform: 'none', boxShadow: 1, '&:hover': { backgroundColor: green[700] } }}
                  onClick={() => loginWithRedirect()}
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  startIcon={<FaGoogle size={18} />}
                  sx={{ mb: 2, color: grey[700], borderColor: grey[400], fontWeight: 600, fontSize: 17, borderRadius: 2, textTransform: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { borderColor: green[600], color: green[700] } }}
                  onClick={() => loginWithRedirect({ connection: "google-oauth2" })}
                >
                  Sign in with Google
                </Button>
              </Box>
            )}
          </Paper>
        </Zoom>
      </Box>
    </Box>
  );
}

export default LoginPage;