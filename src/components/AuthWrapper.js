// src/components/AuthWrapper.js
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function AuthWrapper({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setChecked(false);
      return;
    }

    if (isAuthenticated && user && user.sub && !checked) {
      const checkUser = async () => {
        let userExists = false;
        let userRole = null;
        try {
          console.log(`AuthWrapper: Checking user ${user.sub}`);
          const res = await axios.get(`http://localhost:5000/api/users/check/${user.sub}`);
          userExists = res.data.exists;
          userRole = res.data.role;
          console.log(`AuthWrapper: User exists? ${userExists}, Role: ${userRole}`);
        } catch (err) {
          console.error('AuthWrapper: Error checking user:', err);
        } finally {
          setChecked(true);
          if (!userExists) {
            if (location.pathname !== '/register') {
              console.log("AuthWrapper: User not found, navigating to /register");
              navigate('/register');
            } else {
              console.log("AuthWrapper: User not found, already on /register");
            }
          } else if (userRole) {
            localStorage.setItem('userRole', userRole);
            console.log(`AuthWrapper: User exists, role ${userRole} stored.`);
          }
        }
      };

      checkUser();
    } else if (!isAuthenticated && !isLoading) {
      if (!checked) {
        setChecked(true);
        console.log("AuthWrapper: Not authenticated, check marked as complete.");
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, checked, location.pathname]);

  //if (isLoading) return <div>Loading Authentication...</div>;
  if (isAuthenticated && !checked) return <div>Checking User Registration...</div>;

  return <>{children}</>;
}

export default AuthWrapper;
