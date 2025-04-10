import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PeriodProfile() {
  const [user, setUser] = useState({
    fullName: "User Name",
    email: "user@example.com",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load data from localStorage
    const storedUser = localStorage.getItem("periodUser");
    
    if (storedUser) {
      try {
        setUser(prevUser => ({
          ...prevUser,
          ...JSON.parse(storedUser)
        }));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleProfileUpdate = () => {
    localStorage.setItem("periodUser", JSON.stringify({
      fullName: user.fullName,
      email: user.email,
    }));
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully"
    });
  };

  const handleLogout = () => {
    // Clear necessary data from localStorage
    localStorage.removeItem("periodUser");
    // Don't remove period data in case user wants to log back in
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    
    // Navigate to the tracking choice page
    setTimeout(() => {
      navigate("/tracking-choice");
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
                <AvatarImage src="" alt={user.fullName} />
                <AvatarFallback className="text-2xl bg-lavender/20 text-lavender">
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <CardTitle>{user.fullName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={user.fullName} 
                onChange={(e) => setUser({...user, fullName: e.target.value})} 
                className="bg-gray-50"
              />
            </div>
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
          <CardFooter>
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
