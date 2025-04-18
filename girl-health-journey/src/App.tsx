import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { initializePersistentStorage } from "@/lib/storage-utils";
import { initStorageWatcher, checkForDataLoss, restoreFromBackup } from "@/lib/storage-watcher";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Auth Components
import TermsConditions from "./components/auth/TermsConditions";
import TrackingChoice from "./components/tracking/TrackingChoice";

// Period Tracking Components
import PeriodStart from "./components/period/PeriodStart";
import PeriodDashboard from "./components/period/PeriodDashboard";
import PeriodTracking from "./components/period/PeriodTracking";
import PeriodInsights from "./components/period/insights/PeriodInsights";
import PeriodLearn from "./components/period/learn/PeriodLearn";
import PeriodProfile from "./components/period/profile/PeriodProfile";
import PeriodHistory from "./components/period/history/PeriodHistory";
import PeriodSidebarLayout from "./components/layouts/PeriodSidebarLayout";

const App = () => {
  // Create a new QueryClient instance inside the component
  const queryClient = new QueryClient();
  
  // Initialize persistent storage and storage watcher
  useEffect(() => {
    // Initialize storage utilities
    initializePersistentStorage();
    console.log("Persistent storage initialized");
    
    // Check if data was lost and restore if needed
    if (checkForDataLoss()) {
      console.warn("Data loss detected! Attempting to restore...");
      restoreFromBackup();
    }
    
    // Initialize storage watcher to prevent future data loss
    const cleanup = initStorageWatcher();
    
    // Keep track of page reloads using sessionStorage (which clears on tab close)
    const pageLoads = sessionStorage.getItem('page_loads') ? 
      parseInt(sessionStorage.getItem('page_loads') || '0', 10) : 0;
    sessionStorage.setItem('page_loads', (pageLoads + 1).toString());
    
    console.log(`Page loaded ${pageLoads + 1} times in this session`);
    
    return () => {
      // This will likely never be called in a page context, but it's good practice
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Authentication Routes */}
              <Route path="/" element={<Index />} />
              
              {/* Protected Routes - All routes except the login page */}
              <Route path="/terms" element={
                <ProtectedRoute>
                  <TermsConditions />
                </ProtectedRoute>
              } />
              
              <Route path="/tracking-choice" element={
                <ProtectedRoute>
                  <TrackingChoice />
                </ProtectedRoute>
              } />

              {/* Period Tracking Routes */}
              <Route path="/period-start" element={
                <ProtectedRoute>
                  <PeriodStart />
                </ProtectedRoute>
              } />
              
              <Route path="/period-dashboard" element={
                <ProtectedRoute>
                  <PeriodSidebarLayout />
                </ProtectedRoute>
              }>
                <Route index element={<PeriodDashboard />} />
                <Route path="" element={<PeriodDashboard />} />
                <Route path="tracking" element={<PeriodTracking />} />
                <Route path="insights" element={<PeriodInsights />} />
                <Route path="learn" element={<PeriodLearn />} />
                <Route path="history" element={<PeriodHistory />} />
                <Route path="profile" element={<PeriodProfile />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
