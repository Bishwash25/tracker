import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const currentUser = auth.currentUser;
  const userDataExists = localStorage.getItem('user');

  // If no authenticated user and no user data in localStorage, redirect to login
  if (!currentUser && !userDataExists) {
    console.log("Protected route - User not authenticated, redirecting to login");
    // Redirect them to the login page, but save their intended destination
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 