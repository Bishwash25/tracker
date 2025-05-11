import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function PeriodProfile() {
  const [userEmail, setUserEmail] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  
  const loadUserData = () => {
    // Try to get data from multiple sources in order of priority
    
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

  const handleLogout = async () => {
    try {
      // Show toast first
      toast({
        title: "Logging out",
        description: "You are being logged out..."
      });
      
      // Sign out from Firebase without clearing localStorage data
      await signOut(auth);
      
      // Navigate to the login page (root path)
      navigate("/");
      
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{userEmail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
           Thanks For choosing Floo! We are here to help you track your period and manage your health.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

