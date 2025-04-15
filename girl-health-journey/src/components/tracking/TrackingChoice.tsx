import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Baby, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function TrackingChoice() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Function to get user data from cookie
  const getUserDataFromCookie = () => {
    const cookies = document.cookie.split(';');
    let userData = null;
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userData') {
        try {
          userData = JSON.parse(decodeURIComponent(value));
          return userData;
        } catch (e) {
          console.error('Error parsing user data from cookie:', e);
        }
      }
    }
    
    return null;
  };

  // Function to load user data from all possible storage locations
  const loadUserData = () => {
    // Try to get data from multiple sources in order of priority
    
    // 1. Check Firebase Auth first
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserName(currentUser.displayName || "");
      setUserEmail(currentUser.email || "");
      return;
    }
    
    // 2. Try localStorage
    try {
      const localData = localStorage.getItem('user');
      if (localData) {
        const userData = JSON.parse(localData);
        setUserName(userData.name || "");
        setUserEmail(userData.email || "");
        return;
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    
    // 3. Try sessionStorage
    try {
      const sessionData = sessionStorage.getItem('user');
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        setUserName(userData.name || "");
        setUserEmail(userData.email || "");
        return;
      }
    } catch (e) {
      console.error('Error reading from sessionStorage:', e);
    }
    
    // 4. Try cookies
    const cookieData = getUserDataFromCookie();
    if (cookieData) {
      setUserName(cookieData.name || "");
      setUserEmail(cookieData.email || "");
    }
  };

  // Load data on mount
  useEffect(() => {
    loadUserData();

    // Also set up an auth state listener to update email when auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "");
        setUserEmail(user.email || "");
      }
    });

    return () => unsubscribe();
  }, []);

  // Load data whenever dropdown is opened
  useEffect(() => {
    if (isDropdownOpen) {
      loadUserData();
    }
  }, [isDropdownOpen]);

  const handleSignOut = () => {
    // Don't clear user data from localStorage
    // Just navigate to the login page
    toast({
      title: "Signed out",
      description: "You have been signed out",
    });
    
    // Navigate to the login page
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <DropdownMenu onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 bg-lavender/10 p-2 rounded-full px-4 cursor-pointer hover:bg-lavender/20 transition-colors">
              <User className="h-5 w-5 text-lavender" />
              <span className="font-medium text-lavender">{userName || "User"}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-lavender">
          {userName ? `Welcome, ${userName}!` : 'Choose Your Tracking Journey'}
        </h1>
      </div>
      
      <p className="text-center text-muted-foreground mb-10">
        {userName ? 'Choose your health tracking journey' : 'Select a tracking option to get started'}
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full border-2 hover:border-softpink">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-softpink/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarDays className="h-8 w-8 text-softpink" />
              </div>
              <CardTitle className="text-xl text-softpink">Period Tracking</CardTitle>
              <CardDescription>
                Track your menstrual cycle, symptoms, and fertility windows
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Monitor your cycle and predict upcoming periods</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Track your mood, symptoms, and energy levels</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Identify patterns and get personalized insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Understand your fertility window better</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-softpink hover:bg-softpink/80"
                onClick={() => {
                  // Check if user has already set up period tracking
                  const hasPeriodData = localStorage.getItem("periodStartDate") !== null;
                  if (hasPeriodData) {
                    navigate("/period-dashboard");
                  } else {
                    navigate("/period-start");
                  }
                }}
              >
                {localStorage.getItem("periodStartDate") !== null 
                  ? "View Period Dashboard" 
                  : "Start Period Tracking"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full border-2 hover:border-calmteal">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-calmteal/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Baby className="h-8 w-8 text-calmteal" />
              </div>
              <CardTitle className="text-xl text-calmteal">Pregnancy Tracking</CardTitle>
              <CardDescription>
                Track your pregnancy journey, symptoms, and baby development
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Monitor your pregnancy progress week by week</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Track symptoms, appointments, and health metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Learn about your baby's development</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Prepare for labor and delivery</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-calmteal hover:bg-calmteal/80"
                onClick={() => {
                  // Check if user has already set up pregnancy tracking
                  const hasPregnancyData = localStorage.getItem("lastPeriodDate") !== null;
                  if (hasPregnancyData) {
                    navigate("/pregnancy-dashboard");
                  } else {
                    navigate("/pregnancy-start");
                  }
                }}
              >
                {localStorage.getItem("lastPeriodDate") !== null 
                  ? "View Pregnancy Dashboard" 
                  : "Start Pregnancy Tracking"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
