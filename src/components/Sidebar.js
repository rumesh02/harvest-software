import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0 hook
import {
  House,
  PlusCircle,
  ListUl,
  CheckCircle,
  ChatLeftText,
  CreditCard,
  Gear,
  BoxArrowRight,
} from "react-bootstrap-icons";

const Sidebar = ({
  userName = "Sunimal Perera",
  userRole = "Farmer",
  userAvatar = "./images/farmer.jpg",
}) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const { logout } = useAuth0(); // Get logout function

  const [activePage, setActivePage] = useState(location.pathname);

  useEffect(() => {
    setActivePage(location.pathname);
  }, [location]);

  const handleLogout = () => {
    logout({ returnTo: window.location.origin }); // Logs out user
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="bg-white rounded-3 shadow-sm p-3 d-flex flex-column h-100">
      {/* Logo and Brand */}
      <div className="d-flex align-items-center mb-4 ps-2">
        <img
          src="./images/farmer.jpg"
          alt="Farm-to-Market Logo"
          className="me-2"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
        />
        <h5 className="mb-0 fw-bold">Farm-to-Market</h5>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow-1">
        <ul className="list-unstyled">
          {[
            { id: "/", label: "Dashboard", icon: <House size={18} />, path: "/" },
            { id: "/list-new-item", label: "List New Item", icon: <PlusCircle size={18} />, path: "/list-new-item" },
            { id: "/view-listed-items", label: "View Listed Items", icon: <ListUl size={18} />, path: "/view-listed-items" },
            { id: "/accept-reject-bids", label: "Accept / Reject Bids", icon: <CheckCircle size={18} />, path: "/accept-reject-bids" },
            { id: "/messages", label: "Messages", icon: <ChatLeftText size={18} />, path: "/messages" },
            { id: "/payment-approve", label: "Payment Approve", icon: <CreditCard size={18} />, path: "/payment-approve" },
          ].map((item) => (
            <li key={item.id} className="mb-2">
              <Link
                to={item.path}
                className={`d-flex align-items-center text-decoration-none rounded-pill py-2 px-3 w-100 justify-content-center ${
                  activePage === item.path ? "bg-text-dark fw-bold" : "text-dark"
                }`}
                style={{
                  backgroundColor: activePage === item.path ? "#d4edda" : "transparent",
                  color: activePage === item.path ? "#155724" : "#000",
                }}
              >
                <span className="me-2">{item.icon}</span>
                <span className="text-center flex-grow-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <hr className="my-3" />

      {/* User Profile Section */}
      <div className="d-flex align-items-center mb-3 ps-2">
        <img
          src={userAvatar || "/placeholder.svg"}
          alt={userName}
          className="rounded-circle me-2"
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
        />
        <div>
          <h6 className="mb-0">{userName}</h6>
          <span className="badge bg-success rounded-pill">{userRole}</span>
        </div>
      </div>

      {/* Settings and Logout */}
      <ul className="list-unstyled">
        <li className="mb-2">
          <Link to="/settings" className="d-flex align-items-center text-decoration-none text-dark py-2 px-3">
            <Gear size={18} className="me-2" />
            <span>Settings</span>
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="d-flex align-items-center text-decoration-none text-dark py-2 px-3 w-100 border-0 bg-transparent">
            <BoxArrowRight size={18} className="me-2" />
            <span>Log Out</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
