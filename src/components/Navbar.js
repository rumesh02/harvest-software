import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  useMediaQuery, 
  useTheme,
  Typography,
  Divider
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, isAuthenticated } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-transparent px-4 py-2" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        borderRadius: '0',
        boxShadow: 'none',
        border: 'none'
      }}>
        <div className="container-fluid" style={{ alignItems: 'center' }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Welcome Message */}
          <h4 className="navbar-brand mb-0" style={{ 
            flex: 1, 
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '1.25rem',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            {isAuthenticated ? `Welcome Back, ${user.name}!` : "Welcome Back!"}
          </h4>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav align-items-center" style={{ gap: '0.5rem' }}>
                {/* Notification Bell - Only show for authenticated users */}
                {isAuthenticated && (
                  <li className="nav-item">
                    <NotificationBell />
                  </li>
                )}
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/about"
                    style={{
                      color: '#6b7280',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.backgroundColor = 'rgba(243, 244, 246, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#6b7280';
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    About
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/contact"
                    style={{
                      color: '#6b7280',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.backgroundColor = 'rgba(243, 244, 246, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#6b7280';
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Contact Us
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/help"
                    style={{
                      color: '#6b7280',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.backgroundColor = 'rgba(243, 244, 246, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#6b7280';
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Help
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Notification Bell */}
          {isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationBell />
            </Box>
          )}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen && isMobile}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: '75%',
            maxWidth: '300px',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 20px rgba(0,0,0,0.15)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Menu</Typography>
            <IconButton onClick={handleMenuClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/about" onClick={handleMenuClose}>
                <ListItemText primary="About" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/contact" onClick={handleMenuClose}>
                <ListItemText primary="Contact Us" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/help" onClick={handleMenuClose}>
                <ListItemText primary="Help" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
