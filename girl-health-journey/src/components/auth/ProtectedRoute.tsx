import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, loadingUserData, profileLoaded, isNewUser } = useAuth();

  // If not authenticated, redirect to login
  if (!user && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Show loading spinner while loading user data or profile
  if (loadingUserData || !profileLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
        <div className="flex flex-col items-center">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <span className="text-white text-lg animate-pulse">Loading your data...</span>
        </div>
      </div>
    );
  }

  // After profile is loaded, redirect based on onboarding status
  if (isNewUser === true && location.pathname !== "/terms" && location.pathname !== "/period-start") {
    // New user: force onboarding
    return <Navigate to="/terms" replace />;
  }
  if (isNewUser === false && (location.pathname === "/terms" || location.pathname === "/period-start")) {
    // Existing user: skip onboarding
    return <Navigate to="/period-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;