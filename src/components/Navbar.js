import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white rounded-3 shadow-sm mb-4 px-3 py-2">
      <div className="container-fluid">
        {/* Welcome Message */}
        <h4 className="navbar-brand mb-0">
          {isAuthenticated ? `Welcome Back, ${user.name}!` : "Welcome Back!"}
        </h4>

        {/* Responsive Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/help">
                Help
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
