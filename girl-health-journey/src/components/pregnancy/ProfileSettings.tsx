import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format, parseISO, addWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function ProfileSettings() {
  const [userEmail, setUserEmail] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const loadUserData = () => {
    // Load pregnancy-specific data first
    const storedLastPeriodDate = localStorage.getItem("lastPeriodDate");
    const storedDueDate = localStorage.getItem("dueDate");
    
    if (storedLastPeriodDate) {
      setLastPeriodDate(format(new Date(storedLastPeriodDate), "MMMM d, yyyy"));
    }
    
    if (storedDueDate) {
      const parsedDueDate = new Date(storedDueDate);
      setDueDate(parsedDueDate);
      setSelectedDueDate(parsedDueDate);
    }
    
    // Try to get user data from multiple sources in order of priority
    
    // 1. Check Firebase Auth first
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      setUserEmail(currentUser.email);
      return;
    }
    
    // 2. Try localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserEmail(parsedUser.email || "");
        return;
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
    }
    
    // 3. Try sessionStorage
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) {
        const parsedUser = JSON.parse(sessionUser);
        setUserEmail(parsedUser.email || "");
        return;
      }
    } catch (e) {
      console.error("Error parsing user data from sessionStorage", e);
    }
    
    // 4. Try cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userData') {
          const userData = JSON.parse(decodeURIComponent(value));
          setUserEmail(userData.email || "");
          return;
        }
      }
    } catch (e) {
      console.error("Error parsing user data from cookies", e);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadUserData();
  }, []);
  
  // Refresh data when component is focused
  useEffect(() => {
    // Create an event listener for when the window gains focus
    const handleFocus = () => {
      loadUserData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleDueDateUpdate = () => {
    if (!selectedDueDate) {
      toast({
        title: "Error",
        description: "Please select a new due date",
        variant: "destructive"
      });
      return;
    }

    // Save the new due date
    localStorage.setItem("dueDate", selectedDueDate.toISOString());
    setDueDate(selectedDueDate);
    
    toast({
      title: "Due date updated",
      description: "Your due date has been updated successfully"
    });
  };

  const handleLogout = async () => {
    try {
      // Show toast first
      toast({
        title: "Logging out",
        description: "You are being logged out..."
      });
      
      // Only sign out from Firebase without clearing localStorage data
      await signOut(auth);
      
      // Navigate to the tracking choice page
      navigate("/tracking-choice");
      
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    // No longer clearing pregnancy tracking data from localStorage
    
    toast({
      title: "Navigation to pregnancy start",
      description: "Redirecting to pregnancy start page"
    });
    
    // Navigate to the pregnancy start page
    setTimeout(() => {
      navigate("/pregnancy-start");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Pregnancy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pregnancy Settings</CardTitle>
          <CardDescription>Update your pregnancy information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDueDate ? format(selectedDueDate, "PPP") : "Select a new due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDueDate}
                  onSelect={setSelectedDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Current due date: {dueDate ? format(dueDate, "MMMM d, yyyy") : "Not set"}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastPeriodDate">Last Period Date</Label>
            <Input 
              id="lastPeriodDate" 
              value={lastPeriodDate} 
              readOnly 
              className="bg-gray-50"
            />
            <p className="text-xs text-muted-foreground">To update your last period date, please start a new tracking session</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleDueDateUpdate} className="w-full bg-softpink hover:bg-softpink/90">
            Update Due Date
          </Button>
        </CardFooter>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>{userEmail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start over with a new pregnancy tracking session.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button variant="outline" onClick={handleReset} className="w-full">
            Reset Pregnancy Data
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

