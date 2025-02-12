import React from 'react';
import { useNavigate } from 'react-router-dom';  
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginPage() {
  const navigate = useNavigate();  

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

            <form>
              <div className="mb-3 text-start">
                <label htmlFor="email" className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-3 text-start">
                <label htmlFor="password" className="form-label fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-success text-decoration-none">
                  Forgot password
                </a>
              </div>

              {/* Sign in button - Navigates to Register Page */}
              <button
                type="button"
                className="btn btn-success w-100 mb-3"
                style={{ backgroundColor: '#22C55E' }}
                onClick={() => navigate('/register')}  
              >
                Sign in
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-google" style={{ fontSize: '1.2rem' }}></i>
                Sign in with Google
              </button>

              <p className="text-center">
                Don't have an account?{' '}
                <span 
                  className="text-success text-decoration-none cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/register')} 
                >
                  Sign up for free!
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
