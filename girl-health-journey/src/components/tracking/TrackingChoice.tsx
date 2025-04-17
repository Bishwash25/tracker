import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TrackingChoice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auto-redirect to period tracking on component mount
  useEffect(() => {
    // Short delay before redirecting to show the component briefly
    const timer = setTimeout(() => {
      navigate("/period-start");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const handlePeriodSelect = () => {
    localStorage.setItem("trackingChoice", "period");
    navigate("/period-start");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lavender/10 flex flex-col">
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="max-w-md w-full text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-lavender mb-2">
            Tracking Your Health Journey
          </h1>
          <p className="text-muted-foreground">
            Redirecting you to period tracking...
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full max-w-md">
          <Card
            className="relative overflow-hidden border-lavender/50 hover:border-lavender transition-all cursor-pointer"
            onClick={handlePeriodSelect}
          >
            <div className="absolute top-0 right-0 bg-lavender/10 p-2 rounded-bl-lg">
              <Calendar className="h-6 w-6 text-lavender" />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-lavender">Period Tracking</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Track your cycle, monitor symptoms, and predict upcoming periods
                for better menstrual health awareness.
              </p>
              <Button
                variant="outline"
                className="w-full border-lavender/20 text-lavender hover:bg-lavender/10 hover:text-lavender hover:border-lavender/30"
              >
                Choose Period Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
