import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaGoogle } from "react-icons/fa";

function LoginPage() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

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
                <button
                  type="button"
                  className="btn btn-success w-100 mb-3"
                  onClick={() => loginWithRedirect()}
                >
                  Sign in with Auth0
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => loginWithRedirect({ connection: "google-oauth2" })}
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
