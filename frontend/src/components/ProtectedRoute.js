// src/components/ProtectedRoute.js
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const roles = user && user["https://harvest-system.com/claims/roles"];
  if (requiredRole && (!roles || !roles.includes(requiredRole))) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;