import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function PeriodProfile() {
  const [user, setUser] = useState({
    email: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load data from localStorage
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(prevUser => ({
          ...prevUser,
          email: parsedUser.email || ""
        }));
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
      setTimeout(() => {
        navigate("/tracking-choice");
      }, 1500);
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
    // Clear period tracking data from localStorage
    localStorage.removeItem("periodStartDate");
    localStorage.removeItem("periodEndDate");
    localStorage.removeItem("cycleLength");
    localStorage.removeItem("periodLength");
    
    toast({
      title: "Data reset",
      description: "Your period tracking data has been reset"
    });
    
    // Navigate to the period start page
    setTimeout(() => {
      navigate("/period-start");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* User Profile Card */}
        <Card className="flex-1">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="text-2xl bg-lavender/20 text-lavender">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <CardTitle>Profile</CardTitle>
                <CardDescription>{user.email || 'No email available'}</CardDescription>
              </div>
            </div>
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
            <Button onClick={handleProfileUpdate} className="w-full bg-lavender hover:bg-lavender/90">
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Logout Card */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reset your period tracking data to start over with a new cycle.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button variant="outline" onClick={handleReset} className="w-full">
              Reset Period Data
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
