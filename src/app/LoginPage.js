import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from 'react-router-dom';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaGoogle } from "react-icons/fa";

function LoginPage() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  // Handle role selection
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Login with role
  const handleLogin = () => {
    if (!selectedRole) {
      alert('Please select a role before logging in');
      return;
    }
    
    // Store selected role in localStorage
    localStorage.setItem('userRole', selectedRole);
    
    // Use the default redirect (window.location.origin)
    loginWithRedirect();
  };

  // Handle Google login with role
  const handleGoogleLogin = () => {
    if (!selectedRole) {
      alert('Please select a role before logging in');
      return;
    }
    
    // Store selected role in localStorage
    localStorage.setItem('userRole', selectedRole);
    
    // Redirect to Google OAuth using the default redirect
    loginWithRedirect({
      connection: "google-oauth2"
    });
  };

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'farmer') {
        navigate('/');
      } else if (userRole === 'merchant') {
        navigate('/merchant/dashboard');
      } else if (userRole === 'transporter') {
        navigate('/transporter/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Image Section */}
        <div className="col-lg-6 d-none d-lg-block p-0">
          <img
            src={`${process.env.PUBLIC_URL}/Images/pexels.jpg`}
            alt="Farmers handshake illustration"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        {/* Form Section */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center">
          <div className="w-75 max-w-400">
            <div className="text-center mb-4">
              <h1 className="fw-bold">WELCOME BACK!</h1>
              <p className="text-muted">Welcome back! Please enter your details.</p>
            </div>
            {/* Show user details if logged in */}
            {isAuthenticated ? (
              <div className="text-center">
                <h3>Welcome, {user.name}!</h3>
                <p>{user.email}</p>
                <button className="btn btn-danger w-100 mb-3" onClick={() => logout({ returnTo: window.location.origin })}>
                  Logout
                </button>
              </div>
            ) : (
              <form>
                {/* Role Selection Dropdown */}
                <div className="form-group mb-3">
                  <label htmlFor="role-select" className="mb-2">Select your role:</label>
                  <select 
                    id="role-select" 
                    className="form-select mb-3" 
                    value={selectedRole} 
                    onChange={handleRoleChange}
                  >
                    <option value="">-- Select Role --</option>
                    <option value="farmer">Farmer</option>
                    <option value="merchant">Merchant</option>
                    <option value="transporter">Transporter</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  className="btn btn-success w-100 mb-3"
                  onClick={handleLogin}
                >
                  Sign in 
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <FaGoogle size={18} />
                  Sign in with Google
                </button>
                <p className="text-center">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-success text-decoration-none">
                    Sign up for free!
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;