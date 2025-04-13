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
  const [user, setUser] = useState({
    email: ""
  });

  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load data from localStorage
    const storedLastPeriodDate = localStorage.getItem("lastPeriodDate");
    const storedDueDate = localStorage.getItem("dueDate");
    const storedUser = localStorage.getItem("user");
    
    if (storedLastPeriodDate) {
      setLastPeriodDate(format(new Date(storedLastPeriodDate), "MMMM d, yyyy"));
    }
    
    if (storedDueDate) {
      const parsedDueDate = new Date(storedDueDate);
      setDueDate(parsedDueDate);
      setSelectedDueDate(parsedDueDate);
    }
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          email: parsedUser.email || ""
        });
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleProfileUpdate = () => {
    // No need to update email as it's read-only
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully"
    });
  };

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
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear user data from localStorage
      localStorage.removeItem("user");
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      
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
    // Clear pregnancy tracking data from localStorage
    localStorage.removeItem("lastPeriodDate");
    localStorage.removeItem("dueDate");
    localStorage.removeItem("pregnancyStartDate");
    
    toast({
      title: "Data reset",
      description: "Your pregnancy tracking data has been reset"
    });
    
    // Navigate to the pregnancy start page
    setTimeout(() => {
      navigate("/pregnancy-start");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={user.email} 
              readOnly 
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleProfileUpdate} className="w-full bg-softpink hover:bg-softpink/90">
            Update Profile
          </Button>
        </CardFooter>
      </Card>

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
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Reset your pregnancy tracking data to start over with a new pregnancy.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
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
