import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Components
import TermsConditions from "./components/auth/TermsConditions";
import TrackingChoice from "./components/tracking/TrackingChoice";

// Pregnancy Tracking Components
import PregnancyStart from "./components/pregnancy/PregnancyStart";
import PregnancyLayout from "./components/layouts/PregnancyLayout";
import PregnancyDashboard from "./components/pregnancy/PregnancyDashboard";
import MomTools from "./components/pregnancy/MomTools";
import ProfileSettings from "./components/pregnancy/ProfileSettings";
import PregnancyLearn from "./components/pregnancy/PregnancyLearn";
import PregnancyHistory from "./components/pregnancy/PregnancyHistory";

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
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/tracking-choice" element={<TrackingChoice />} />

              {/* Pregnancy Tracking Routes */}
              <Route path="/pregnancy-start" element={<PregnancyStart />} />
              <Route path="/pregnancy-dashboard" element={<PregnancyLayout />}>
                <Route index element={<PregnancyDashboard />} />
                <Route path="" element={<PregnancyDashboard />} />
                <Route path="mom" element={<MomTools />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="learn" element={<PregnancyLearn />} />
                <Route path="history" element={<PregnancyHistory />} />
              </Route>

              {/* Period Tracking Routes */}
              <Route path="/period-start" element={<PeriodStart />} />
              <Route path="/period-dashboard" element={<PeriodSidebarLayout />}>
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
