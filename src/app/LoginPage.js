import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from 'react-router-dom';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaGoogle } from "react-icons/fa";

function LoginPage() {
  const { loginWithRedirect, logout, isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

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
    return <div>Loading...</div>;
  }

  console.log("Auth0 user:", user);

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
              <h1 className="fw-bold text-center">WELCOME BACK!</h1>
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
                <button
                  type="button"
                  className="btn btn-success w-100 mb-3"
                  onClick={() => loginWithRedirect()}
                >
                  Sign in 
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => loginWithRedirect({ connection: "google-oauth2" })}
                >
                  <FaGoogle size={18} />
                  Sign in with Google
                </button>
                
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;